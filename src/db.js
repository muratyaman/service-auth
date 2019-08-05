import { v4 as uuid } from 'uuid';
//import { parse, format } from 'date-fns';
import dbAdapters from './dbAdapters';
import { logDebug } from './log';
import mockData from './mockData';

export const newId = () => uuid();

const defaultData = {
  current_positions: [],
  position_history: [],
};

let dbAdapter, db;

/**
 * create a new db instance
 * @param config Config
 * @returns {Promise<*>}
 */
export const newDb = async (config) => {
  const da = config.DB_ADAPTER;
  if (!(da in dbAdapters)) {
    throw new Error('Unknown db adapter ' + da);
  }
  dbAdapter = dbAdapters[da];
  
  const generateDefaultData = !! config.IS_TEST;
  let data = defaultData;
  if (generateDefaultData) {// set some defaults?
    data = mockData();
  }
  
  db = await dbAdapter.newDb(config, data);
  logDebug('new db adapter ready');
  return db;
};

export const usersRepo = () => dbAdapter.newRepo('users');

export default () => ({ newId, newDb, usersRepo });
