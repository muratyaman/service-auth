import jwtManager from 'jsonwebtoken';
import {
  logDebug, hashPassword, verifyPassword, asyncForEach, pruneUsername, isStrongPassword,
} from './helpers';
import { newId, newDb, usersRepo } from './db';

let config, db;

const debugOn = () => config.IS_DEV;

export const api_init = async (configIn) => {
  config = configIn;
  db = await newDb(config);
};

export const api_err_handler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'invalid token' });
    return;
  }
  res.status(500).json({ error: err });//err.message });
};

export const api_version = (req, res) => {
  logDebug('GET /api/auth START');
  res.json({ ts: new Date(), version: config.VERSION });
};

export const api_login = async (req, res) => {
  logDebug('POST /api/auth/login START', req.body);
  let token, data, error = 'Invalid credentials';
  try {
    const repo = usersRepo();
    let { username, password } = req.body;
    if (username && password) {
      username = username.toLowerCase();
      const found = await repo.findOne({ username });
      if (found && await verifyPassword(password, found.password_hash)) {
        const { id, first_name, last_name } = found;
        const userData = { id, username, first_name, last_name };
        token = jwtManager.sign(userData, config.JWT_SECRET);
        data = { id, username, first_name, last_name };
        error = null;
      }
    }
  } catch (err) {
    error = err.message;
    logDebug('POST /api/auth/login ERROR', err);
  }
  logDebug('POST /api/auth/login END', { token, error, data });
  return res.json({ token, error, data });
};

export const api_logout = (req, res) => {
  logDebug('DELETE /api/auth/logout');
  if (!req.user) return res.sendStatus(401);// protected * * *
  let token, data, error;
  
  // do nothing, as we do not save JWT in anywhere; only app must get rid of it!
  data = true;
  
  logDebug('DELETE /api/auth/logout', { token, error, data });
  res.json({ token, error, data });
};

export const api_user = (req, res) => {
  logDebug('GET /api/auth/user');
  if (!req.user) return res.sendStatus(401);// protected * * *
  
  const data = req.user;//decoded JWT, not the full user object
  res.json({ data });
};

export const api_users = async (req, res) => {
  logDebug('GET /api/auth/users');
  if (!req.user) return res.sendStatus(401);// protected * * *
  
  let { ids = '' } = req.query;
  ids = ids !== '' ? ids.split(',') : [];
  
  const repo = usersRepo();
  let data = await repo.listAll();
  
  if (ids && ids.length) {
    data = data.filter(row => {
      return 0 <= ids.findIndex(id => id === row.id);
    });
  }
  
  data = data.map(row => {
    const { id, username, first_name, last_name } = row;
    return { id, username, first_name, last_name };// ignore 'password_hash' etc.
  });
  
  return res.json({ data });
};

export const api_users_create = async (req, res) => {
  const urlInfo = `POST /api/auth/users`;
  logDebug(urlInfo);
  
  let data, error, debug, params;
  try {
    const repo = usersRepo();
    let { username, password, first_name = null, last_name = null, email = null } = req.body;
    if (!isStrongPassword(password)){
      throw new Error('Enter a strong password');
    }
    username = pruneUsername(username);
    // TODO: check strong password
    params = { username };
    const userRow = await repo.findOne(params);
    if (userRow) throw new Error('Enter another username');
    
    const password_hash = await hashPassword(password);
    const userData = {
      id: newId(), username, password_hash, first_name, last_name, email,
    };
    data = await repo.insertOne(userData);
  } catch (err) {
    error = err.message;
    if (debugOn()) {
      debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  return res.json({ data, error, debug });
};

export const api_users_retrieve = async (req, res) => {
  const { username } = req.params;
  const urlInfo = `GET /api/auth/users/${username}`;
  logDebug(urlInfo);
  if (!req.user) return res.sendStatus(401);// protected * * *
  //if (req.user.username !== 'admin') return res.sendStatus(401);// protected * * *
  
  let data, error, debug, params;
  try {
    const repo = usersRepo();
    params = { username };
    const userRow = await repo.findOne(params);
    if (!userRow) throw new Error('User not found');
    
    const { id, username, first_name, last_name } = userRow;
    data = { id, username, first_name, last_name };
  } catch (err) {
    error = err.message;
    if (debugOn()) {
      debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  return res.json({ data, error, debug });
};

export const api_users_update = async (req, res) => {
  const { username } = req.params;
  const urlInfo = `PUT /api/auth/users/${username}`;
  logDebug(urlInfo);
  if (!req.user) return res.sendStatus(401);// protected * * *
  if (req.user.username !== username) return res.sendStatus(401);// protected * * *
  
  let data, error, debug, params;
  try {
    const repo = usersRepo();
    params = { username };
    const userRow = await repo.findOne(params);
    if (!userRow) throw new Error('User not found');
    
    let modifiedUserRow = Object.assign({}, userRow);// make new object
    const newData = req.body || {};
    const fields = ['username', 'first_name', 'last_name', 'email', 'password'];
    await asyncForEach(fields, async (field) => {
      if ((field in newData) && newData[field]) {
        const val = newData[field];
        switch (field) {
          case 'username':
            modifiedUserRow[field] = pruneUsername(val); break;
          case 'password':
            // TODO: check strong password
            modifiedUserRow['password_hash'] = await hashPassword(val); break;
          case 'email':
            // TODO: validate email
            //modifiedUserRow[field] = validateEmail(val); break;
          default: modifiedUserRow[field] = val;
        }
      }
    });
    data = await repo.updateOne(userRow.id, modifiedUserRow);
  } catch (err) {
    error = err.message;
    if (debugOn()) {
      debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  return res.json({ data, error, debug });
};

export const api_users_delete = async (req, res) => {
  const { username } = req.params;
  const urlInfo = `DELETE /api/auth/users/${username}`;
  logDebug(urlInfo);
  if (!req.user) return res.sendStatus(401);// protected * * *
  if (req.user.username !== username) return res.sendStatus(401);// protected * * *
  
  let data, error, debug, params;
  try {
    const repo = usersRepo();
    params = { username };
    const userRow = repo.findOne(params);
    if (!userRow) throw new Error('User not found');
    data = await repo.deleteOne(userRow.id);
  } catch (err) {
    error = err.message;
    if (debugOn()) {
      debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  return res.json({ data, error, debug });
};
