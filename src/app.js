import bodyParser from 'body-parser';
//import cors from 'cors';
//import express from 'express';
import jwt from 'express-jwt';
import {
  api_init,
  api_err_handler,
  api_login,
  api_logout,
  api_user,
  api_users,
  api_users_create,
  api_users_retrieve,
  api_users_update,
  api_users_delete,
  api_version,
} from './api';

export const initApp = async (app, config) => {
  await api_init(config);
  //app.options('*', cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(jwt({ secret: config.JWT_SECRET, credentialsRequired: false }));
  //app.use(express.static(config.PUBLIC_STATIC_DIR));
  app.use(api_err_handler);
  app.get('/api/auth', api_version);
  app.post('/api/auth/login', api_login);
  app.get('/api/auth/user', api_user);// get current user
  app.get('/api/auth/users/me', api_user);// get current user
  app.delete('/api/auth/logout', api_logout);
  app.get('/api/auth/logout', api_logout);
  app.get('/api/auth/users', api_users);
  app.post('/api/auth/users', api_users_create);
  app.get('/api/auth/users/:username', api_users_retrieve);
  app.put('/api/auth/users/:username', api_users_update);
  app.patch('/api/auth/users/:username', api_users_update);
  app.delete('/api/auth/users/:username', api_users_delete);
};
