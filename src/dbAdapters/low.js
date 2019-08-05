import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import Memory from 'lowdb/adapters/Memory';
import { logDebug } from '../log';

let db;

export const newDb = async (config, data = {}) => {
  let adapter, generateDefaultData = false;
  if (config.IS_TEST) {
    adapter = new Memory();
    generateDefaultData = true;
  } else {
    adapter = new FileSync(config.LOW_FILENAME);
  }
  db = await low(adapter);
  // data required only when db is empty
  await db.defaults(data).write();
  return db;
};

export const dbRepo = (name) => {
  const repoDesc = `dbRepo(${name})`;
  logDebug('NEW', repoDesc);
  
  const findIdx = (filterFunc) => {
    const row = db.get(name).value().findIndex(filterFunc);
    logDebug(`${repoDesc}.findIdx`, row);
    return row;
  };
  const findOne = (params) => {
    const row = db.get(name).find(params).value();
    logDebug(`${repoDesc}.findOne`, params, row);
    return row;
  };
  return {
    findOne,
    findIdx,
    listAll: () => {
      const rows = db.get(name).value();
      logDebug(`${repoDesc}.listAll`, rows.length);
      return rows;
    },
    insertOne: (row) => {
      const newRows = db.get(name).push(row).write();
      logDebug(`${repoDesc}.insertOne`, row, newRows.length);
      return 0 < newRows.length;
    },
    updateOne: (params, newRow) => {
      const idx = findIdx(params);//TODO: refactor
      return db.update(name, rows => {
        //logDebug('UPDATE START', name, rows);
        let row = rows[idx];
        rows[idx] = Object.assign(row, newRow);
        //logDebug('UPDATE END', name, rows);
        return rows;
      }).write();
    },
    deleteOne: (idx) => {
      let rows = db.get(name);
      delete rows[idx];
      return db.set(name, rows).write();
    },
  };
};
