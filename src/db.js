import { v4 as uuid } from 'uuid';
import { parse, format } from 'date-fns';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import Memory from 'lowdb/adapters/Memory';
import { logDebug } from './log';
import { FILE_DB, IS_TEST } from './config';

export const newId = () => uuid();

const mockUsers = () => [
  {
    id: uuid(),
    username: 'john.smith',
    password: 'smith',
    first_name: 'john',
    last_name: 'smith',
  }
];

const mockData = () => ({
  users: mockUsers(),
});

const defaultData = {
  users: [],
};

let db;

export const newDb = async () => {
  let adapter, generateDefaultData = false;
  if (IS_TEST) {
    adapter = new Memory();
    generateDefaultData = true;
  } else {
    adapter = new FileSync(FILE_DB);
  }
  db = await low(adapter);
  let data = defaultData;
  if (generateDefaultData) {// set some defaults?
    data = mockData();
  }
  // data required only when db is empty
  await db.defaults(data).write();
  return db;
};

export const dbRepo = (name) => {
  const repoDesc = `dbRepo(${name})`;
  logDebug('NEW', repoDesc);
  return {
    findOne: (params) => {
      const row = db.get(name).find(params).value();
      logDebug(`${repoDesc}.findOne`, params, row);
      return row;
    },
    findIdx: (filterFunc) => {
      const row = db.get(name).value().findIndex(filterFunc);
      logDebug(`${repoDesc}.findIdx`, row);
      return row;
    },
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
    updateOne: (idx, newRow) => {
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

export const usersRepo = dbRepo('users');

export const usersList = () => {
  logDebug('usersList');
  return usersRepo.listAll()
  .map(user => {
    const { id, username, first_name, last_name } = user;
    return { id, username, first_name, last_name };
  });
};
