import { newDb as low_newDb, dbRepo as low_dbRepo } from './low';
import { newDb as mongodb_newDb, dbRepo as mongodb_dbRepo } from './mongodb';
import { newDb as pgsql_newDb, dbRepo as pgsql_dbRepo } from './pgsql';

export default {
  low: {
    newDb: low_newDb,
    dbRepo: low_dbRepo,
  },
  mongodb: {
    newDb: mongodb_newDb,
    dbRepo: mongodb_dbRepo,
  },
  pgsql: {
    newDb: pgsql_newDb,
    dbRepo: pgsql_dbRepo,
  },
};
