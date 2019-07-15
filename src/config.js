import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

import packageObj from '../package.json';
export const VERSION = packageObj.version;

const penv = process.env;

export const IS_PRODUCTION = penv.NODE_ENV && (penv.NODE_ENV === 'production');
export const IS_TEST = penv.NODE_ENV && (penv.NODE_ENV === 'test');
export const IS_DEV = penv.NODE_ENV && (penv.NODE_ENV === 'dev');

export const CONSOLE_LOG = (penv.CONSOLE_LOG || 0) && !IS_TEST;

export const HTTP_PORT = penv.HTTP_PORT || 0;

export const FILE_DB = penv.FILE_DB;

export const JWT_SECRET = penv.JWT_SECRET;

export const PUBLIC_STATIC_DIR = penv.PUBLIC_STATIC_DIR || path.join(__dirname, '..', 'public');
