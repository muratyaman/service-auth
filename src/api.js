import jwtManager from 'jsonwebtoken';
import { logDebug } from './log';
import { newId, newDb } from './db';

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
  res.json({ ts: new Date(), version: config.VERSION });
};

export const api_login = (req, res) => {
  logDebug('POST /api/auth/login START', req.body);
  let token, data, error = 'Invalid credentials';
  try {
    let { username, password } = req.body;
    if (username && password) {
      username = username.toLowerCase();
      const found = usersRepo.findOne({ username });
      // TODO: compare hashed passwords
      if (found && found.password_hash === password) {
        const { id, first_name, last_name } = found;
        const userData = { id, username, first_name, last_name };
        token = jwtManager.sign(userData, config.JWT_SECRET);
        data = { id, username, first_name, last_name };
        error = null;
      }
    }
  } catch (err) {
    error = err.message;
  }
  logDebug('POST /api/auth/login END', { token, error, data });
  res.json({ token, error, data });
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

export const api_users = (req, res) => {
  logDebug('GET /api/auth/users');
  if (!req.user) return res.sendStatus(401);// protected * * *
  
  const data = usersRepo().listAll().map(row => {
    const { id, username, first_name, last_name } = row;
    return { id, username, first_name, last_name };// ignore password_hash
  });
  res.json({ data });
};

export const api_users_create = async (req, res) => {
  const urlInfo = `POST /api/auth/users`;
  logDebug(urlInfo);
  
  let data, error, debug, params;
  try {
    let { username, password, first_name, last_name } = req.body;
    params = { username };
    const userRow = usersRepo().findOne(params);
    if (userRow) throw new Error('Invalid username');
    
    const userData = {
      id: newId(), username, first_name, last_name,
      password, // TODO: hash password
    };
    data = usersRepo().insertOne(userData);
    
  } catch (err) {
    error = err.message;
    if (debugOn()) {
      debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  res.json({ data, error, debug });
};

export const api_users_retrieve = async (req, res) => {
  const { username } = req.params;
  const urlInfo = `GET /api/auth/users/${username}`;
  logDebug(urlInfo);
  if (!req.user) return res.sendStatus(401);// protected * * *
  //if (req.user.username !== 'admin') return res.sendStatus(401);// protected * * *
  
  let data, error, debug, params;
  try {
    params = { username };
    const userRow = usersRepo().findOne(params);
    if (!userRow) throw new Error('User not found');
    
    data = userRow;
    
  } catch (err) {
    error = err.message;
    if (debugOn()) {
      debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  res.json({ data, error, debug });
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
    const userRow = repo.findOne(params);
    if (!userRow) throw new Error('User not found');
    
    // username, password, first_name, last_name
    // TODO: can not change username ?!
    // TODO: password_hash = hash(password)
    let userModifiedData = Object.assign({}, userRow, req.body, { username });
    data = repo.updateOne(userRow.id, userModifiedData);
    
  } catch (err) {
    error = err.message;
    if (debugOn()) {
      debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  res.json({ data, error, debug });
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
    data = repo.deleteOne(userRow.id);
  } catch (err) {
    error = err.message;
    if (debugOn()) {
      debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  res.json({ data, error, debug });
};
