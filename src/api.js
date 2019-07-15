import jwtManager from 'jsonwebtoken';
import { logDebug } from './log';
import { JWT_SECRET, VERSION, IS_DEV } from './config';
import {
  newId,
  usersList,
  usersRepo,
} from './db';

const debug = IS_DEV;

export const api_err_handler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'invalid token' });
    return;
  }
  res.status(500).json({ error: err });//err.message });
};

export const api_version = (req, res) => {
  res.json({ ts: new Date(), version: VERSION });
};

export const api_login = (req, res) => {
  logDebug('POST /api/auth/login START', req.body);
  let token = null, user = null, error = 'Invalid credentials';
  try {
    let { username, password } = req.body;
    if (username && password) {
      username = username.toLowerCase();
      const found = usersRepo.findOne({ username });
      if (found && found.password === password) {
        const { id, first_name, last_name } = found;
        const userData = { id, username, first_name, last_name };
        token = jwtManager.sign(userData, JWT_SECRET);
        user = { id, username, first_name, last_name };
        error = null;
      }
    }
  } catch (err) {
    error = err.message;
  }
  logDebug('POST /api/auth/login END', { token, error, user });
  res.json({ token, error, user });
};

export const api_user = (req, res) => {
  logDebug('GET /api/auth/user');
  if (!req.user) return res.sendStatus(401);// protected * * *
  
  const data = req.user;//decoded JWT, not the full user object
  res.json(data);
};

export const api_users = (req, res) => {
  logDebug('GET /api/auth/users');
  if (!req.user) return res.sendStatus(401);// protected * * *
  
  const data = usersList();
  res.json(data);
};

export const api_users_create = async (req, res) => {
  const urlInfo = `POST /api/auth/users`;
  logDebug(urlInfo);
  
  let data = {}, params;
  try {
    let { username, password, first_name, last_name } = req.body;
    params = { username };
    const userRow = usersRepo.findOne(params);
    if (userRow) throw new Error('Invalid username');
    
    const userData = {
      id: newId(), username, first_name, last_name,
      password, // TODO: hash password
    };
    data.result = usersRepo.insertOne(userData);
    
  } catch (err) {
    data.error = err.message;
    if (debug) {
      data.debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  res.json(data);
};

export const api_users_update = async (req, res) => {
  const { username } = req.params;
  const urlInfo = `PUT /api/auth/users/${username}`;
  logDebug(urlInfo);
  if (!req.user) return res.sendStatus(401);// protected * * *
  if (req.user.username !== 'admin') return res.sendStatus(401);// protected * * *
  
  let data = {}, params;
  try {
    params = { username };
    const idx = usersRepo.findIdx(params);
    const userRow = usersRepo.findOne(params);
    if (!userRow) throw new Error('User not found');
    
    // username, password, first_name, last_name
    // but can not change username
    let userModifiedData = Object.assign({}, userRow, req.body, { username });
    data.result = usersRepo.updateOne(idx, userModifiedData);
    
  } catch (err) {
    data.error = err.message;
    if (debug) {
      data.debug = err;
    }
    logDebug(urlInfo + ' ERR', err);
  }
  res.json(data);
};
