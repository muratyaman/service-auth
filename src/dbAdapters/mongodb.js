import { MongoClient } from 'mongodb';
//import assert from 'assert';
import { logDebug } from '../log';

let db, dbClient;

export const newDb = async (config, data = {}) => {
  const dbUrl = config.MONGODB_URL;
  const dbName = config.MONGODB_NAME;
  const dbOptions = { useNewUrlParser: true };
  dbClient = await MongoClient.connect(dbUrl, dbOptions);
  logDebug('connected to mongodb successfully');
  db = dbClient.db(dbName);
  
  // TODO: insert data, if any
  
  return db;
};

export const dbClose = () => {
  try {
    dbClient.close();
  } catch (err) {
    logDebug('error closing mongodb', err);
  }
};

export const dbColl = (name) => {
  return db.collection(name);
};

export const dbRepo = (name) => {
  const repoDesc = `dbRepo(${name})`;
  logDebug('NEW', repoDesc);
  return {
    findOne: async (params) => {
      const row = await dbColl(name).findOne(params);
      logDebug(`${repoDesc}.findOne`, params, row);
      return row;
    },
    listAll: async (options = {}) => {
      const rows = await dbColl(name).find(options).toArray();
      logDebug(`${repoDesc}.listAll`, rows.length);
      return rows;
    },
    insertOne: async (row) => {
      const result = await dbColl(name).insertOne(row);
      logDebug(`${repoDesc}.insertOne`, row, result);
      return 0 < result.insertedCount;
    },
    updateOne: async (_id, newRow) => {
      const result = await dbColl(name).updateOne({ _id }, { $set: newRow });
      logDebug(`${repoDesc}.updateOne`, newRow, result);
      //r = await col.updateOne({a:1}, {$set: {b: 1}});
      //assert.equal(1, result.matchedCount);
      //assert.equal(1, result.modifiedCount);
      return 0 < result.modifiedCount;
    },
    deleteOne: async (_id) => {
      const result = await dbColl(name).deleteOne({ _id });
      //assert.equal(1, result.deletedCount);
      return 0 < result.deletedCount;
    },
  };
};
