import { Client, Pool } from 'pg';
//import assert from 'assert';
import { logDebug } from '../helpers';

let db, dbClient;

export const newDb = async (config, data = {}) => {
  //const dbUrl = config.PGSQL_URL;
  //const dbName = config.PGSQL_NAME;
  //const dbOptions = { useNewUrlParser: true };
  
  //const dbClient = new Client();
  //await dbClient.connect();
  
  dbClient = new Pool();
  
  logDebug('connected to pgsql successfully');
  //db = dbClient.db(dbName);
  
  // TODO: insert data, if any
  
  return dbClient;//db;
};

export const dbClose = () => {
  try {
    dbClient.end();
  } catch (err) {
    logDebug('error closing pgsql', err);
  }
};

export const newDbRepo = (name) => {
  const repoDesc = `dbRepo(${name})`;
  logDebug('NEW', repoDesc);
  
  const query = async (text, params = null) => {
    logDebug(repoDesc, 'query start', text, params);
    const result = await dbClient.query(text, params);//result.rows, result.rowCount;
    logDebug(repoDesc, 'query end', result);
    return result;
  };
  
  const placeHolder = (params = []) => {
    // insert param to params before generating place holder
    const p = params.length;
    return `\$${p}`;
  };
  
  const select = async (where = '', params = null, limit = 0) => {
    const text = 'SELECT * FROM ' + name
      + (where ? ' WHERE ' + where : '')
      + (limit ? ' LIMIT ' + limit : '');
    return await query(text, params);
  };
  
  const selectOne = async (where = '', params = null) => {
    const result = await select(where, params, 1);
    return result && result.rows && result.rows[0] ? result.rows[0] : null;
  };
  
  const insertOne = async(row) => {
    const fields = [], params = [], placeHolders = [];
    Object.entries(row).forEach(([ field , value ]) => {
      fields.push(field);
      params.push(value);
      placeHolders.push(placeHolder(params));
    });
    // param placeholders: $1, $2, etc.
    const text = 'INSERT INTO ' + name + ' (' + fields.join(', ') + ') '
      + 'VALUES (' + placeHolders.join(', ') + ') '
      + 'RETURNING *';
    return await query(text, params);
  };
  
  const updateOne = async(condition, row, limit = 1) => {
    const assignments = [], where = [], params = [];
    Object.entries(row).forEach(([ field, value ]) => {
      params.push(value);
      assignments.push(field + ' = ' + placeHolder(params));
    });
    Object.entries(condition).forEach(([ field , value ]) => {
      params.push(value);
      where.push(field + ' = ' + placeHolder(params));
    });
    const assignmentsStr = assignments.join(', ');
    const whereStr = where ? ' WHERE ' + where.join(' AND ') : '';
    const limitStr = limit ? `LIMIT ${limit}` : '';
    const text = `UPDATE ${name} SET ${assignmentsStr} ${whereStr} ${limitStr}`;
    return await query(text, params);
  };
  
  const deleteOne = async(condition, limit  = 1) => {
    const where = [], params = [];
    Object.entries(condition).forEach(([field , value]) => {
      params.push(value);
      where.push(field + ' = ' + placeHolder(params));
    });
    const whereStr = where ? 'WHERE ' + where.join(' AND ') : '';
    const limitStr = limit ? `LIMIT ${limit}` : '';
    const text = `DELETE FROM ${name} ${whereStr} ${limitStr}`;
    return await query(text, params);
  };
  
  return {
    findOne: async (filters = {}) => {
      let where = [], params = [];
      Object.entries(filters).forEach(([field, value]) => {
        params.push(value);
        where.push(field + ' = ' + placeHolder(params));
      });
      const whereStr = where.join(' AND ');
      const row = await selectOne(whereStr, params);
      logDebug(`${repoDesc}.findOne`, params, row);
      return row;
    },
    listAll: async (filters = {}) => {
      let where = [], params = [];
      if ('ids' in filters) {
        const { ids } = filters;
        if (Array.isArray(ids)) {
          const idList = ids.map(id => {
            params.push(id);
            return placeHolder(params);
          }).join(', ');
          where.push(`id IN (${idList})`);
        }
      }
      const whereStr = where ? where.join(' AND ') : '';
      const result = await select(whereStr, params);// TODO: use options
      const rows = result.rows;
      logDebug(`${repoDesc}.listAll`, result.rowCount);
      return rows;
    },
    insertOne: async (row) => {
      const result = await insertOne(row);
      logDebug(`${repoDesc}.insertOne`, row, result);
      return 1 === result.rowCount;
    },
    updateOne: async (id, newRow) => {
      const result = await updateOne({ id }, newRow);
      logDebug(`${repoDesc}.updateOne`, newRow, result);
      return 1 === result.rowCount;
    },
    deleteOne: async (id) => {
      const result = await deleteOne({ id });
      logDebug(`${repoDesc}.deleteOne`, { id }, result);
      return 1 === result.rowCount;
    },
  };
};
