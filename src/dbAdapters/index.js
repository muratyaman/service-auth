import { newDb as low_newDb, newDbRepo as low_newDbRepo } from './low';
import { newDb as mongodb_newDb, newDbRepo as mongodb_newDbRepo } from './mongodb';
import { newDb as pgsql_newDb, newDbRepo as pgsql_newDbRepo } from './pgsql';

export default {
  low: {
    newDb: low_newDb,
    newDbRepo: low_newDbRepo,
  },
  mongodb: {
    newDb: mongodb_newDb,
    newDbRepo: mongodb_newDbRepo,
  },
  pgsql: {
    newDb: pgsql_newDb,
    newDbRepo: pgsql_newDbRepo,
  },
};
