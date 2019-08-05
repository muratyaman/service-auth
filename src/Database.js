import DatabaseRepo from './DatabaseRepo';

export default class Database {
  
  constructor(config, dbClient){
    this.config = config;
    this.dbClient = dbClient;
  }
  
  newRepo(name){
    return new DatabaseRepo(this, name);
  }
  
}
