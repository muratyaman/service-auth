import express from 'express';
import http from 'http';
import config from './config';
import { logDebug } from './log';
import { initApp } from './app';

(async () => {
  try {
    const app = express();
    await initApp(app, config);
    http.createServer(app).listen(config.HTTP_PORT, function () {
      logDebug('Auth service listening on HTTP port', config.HTTP_PORT);
    });
  } catch (err) {
    console.error('Error starting auth service', err);
  }
})();
