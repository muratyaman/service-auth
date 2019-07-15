import bodyParser from 'body-parser';
//import cors from 'cors';
//import express from 'express';
import jwt from 'express-jwt';
import { JWT_SECRET, PUBLIC_STATIC_DIR } from './config';
import {
  api_err_handler,
  api_login,
  api_user,
  api_users,
  api_users_create,
  api_users_update,
  api_version
} from './api';

export const initApp = (app) => {
  //app.options('*', cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(jwt({ secret: JWT_SECRET, credentialsRequired: false }));
  //app.use(express.static(PUBLIC_STATIC_DIR));
  app.use(api_err_handler);
  app.get('/api/auth', api_version);
  app.post('/api/auth/login', api_login);
  app.get('/api/auth/users', api_users);
  app.post('/api/auth/users', api_users_create);
  app.put('/api/auth/users/:username', api_users_update);
  app.patch('/api/auth/users/:username', api_users_update);
  app.get('/api/auth/user', api_user);// get current user
};
