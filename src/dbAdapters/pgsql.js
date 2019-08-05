import { Client, Pool } from 'pg';
//import assert from 'assert';
import { logDebug } from '../log';

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
  
  return db;
};

export const dbClose = () => {
  try {
    dbClient.end();
  } catch (err) {
    logDebug('error closing pgsql', err);
  }
};

export const dbRepo = (name) => {
  const repoDesc = `dbRepo(${name})`;
  logDebug('NEW', repoDesc);
  
  const query = async (text, params = null) => {
    return await dbClient.query(text, params);//result.rows, result.rowCount;
  };
  
  const select = async (params = null) => {
    const text = 'SELECT * FROM ' + name;
    return await dbClient.query(text, params);
    //return result;//result.rows, result.rowCount;
  };
  
  const selectOne = async (params = null) => {
    const result = await select(params);
    return result && result.rows && result.rows[0] ? result.rows[0] : null;
  };
  
  const insertOne = async(row) => {
    const fields = [], values = [];
    Object.entries(row).forEach(([field , value]) => {
      fields.push(field);
      values.push(value);
    });
    const text = 'INSERT INTO ' + name + ' (' + fields.concat(', ') + ') '
      + 'VALUES (' + values.map(v => '?').concat(', ') + ') '
      + 'RETURNING *';
    return await query(text, values);
  };
  
  const updateOne = async(condition, row, limit = 1) => {
    const assignments = [], where = [], values = [];
    Object.entries(row).forEach(([field , value]) => {
      assignments.push(field + ' = ?');
      values.push(value);
    });
    Object.entries(condition).forEach(([field , value]) => {
      where.push(field + ' = ?');
      values.push(value);
    });
    const assignmentsStr = assignments.concat(', ');
    const whereStr = where.concat(' AND ');
    const limitStr = limit ? `LIMIT ${limit}` : '';
    const text = `UPDATE ${name} SET ${assignmentsStr} WHERE ${whereStr} ${limitStr}`;
    return await query(text, values);
  };
  
  const deleteOne = async(condition, limit  = 1) => {
    const where = [], values = [];
    Object.entries(condition).forEach(([field , value]) => {
      where.push(field + ' = ?');
      values.push(value);
    });
    const whereStr = where.concat(' AND ');
    const limitStr = limit ? `LIMIT ${limit}` : '';
    const text = `DELETE FROM ${name} WHERE ${whereStr} ${limitStr}`;
    return await query(text, values);
  };
  
  return {
    findOne: async (params) => {
      const row = await selectOne(params);
      logDebug(`${repoDesc}.findOne`, params, row);
      return row;
    },
    listAll: async (options = {}) => {
      const result = await select();// TODO: use options
      const rows = result.rows;
      logDebug(`${repoDesc}.listAll`, result.rowCount);
      return rows;
    },
    insertOne: async (row) => {
      const result = await insertOne(row);
      logDebug(`${repoDesc}.insertOne`, row, result);
      return result;
    },
    updateOne: async (id, newRow) => {
      const result = await updateOne({ id }, newRow);
      logDebug(`${repoDesc}.updateOne`, newRow, result);
      return result;
    },
    deleteOne: async (id) => {
      const result = await deleteOne({ id });
      logDebug(`${repoDesc}.deleteOne`, { id }, result);
      return result;
    },
  };
};
