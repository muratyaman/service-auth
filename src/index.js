import express from 'express';
import http from 'http';
import { HTTP_PORT, FILE_DB } from './config';
import { newDb } from './db';
import { logDebug } from './log';
import { initApp } from './app';

let app, db;

(async () => {
  try {
    db = await newDb();
  } catch (e) {
    console.error('Error accessing json file referenced as', FILE_DB);
  }
  if (db) {
    app = express();
    initApp(app);
    
    http.createServer(app).listen(HTTP_PORT, function () {
      logDebug('Auth service listening on HTTP port', HTTP_PORT);
    });
  }
})();
