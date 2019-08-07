import dotenv from 'dotenv';
//import path from 'path';
import packageObj from '../package.json';

dotenv.config();

export const VERSION = packageObj.version;

const penv = process.env;

export const NODE_ENV      = penv.NODE_ENV || '';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_TEST       = NODE_ENV === 'test';
export const IS_DEV        = NODE_ENV === 'dev';

export const CONSOLE_LOG = (penv.CONSOLE_LOG || 0) && !IS_TEST;

export const HTTP_PORT = penv.HTTP_PORT || 0;// 0 => pick a free port

export const DB_ADAPTER = penv.DB_ADAPTER || 'low';

export const JWT_SECRET = penv.JWT_SECRET || 0;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}

export const LOCALE = penv.LOCALE || 'en-GB';

export const jwtConfig = () => {
  return {
    secret: JWT_SECRET,
    credentialsRequired: false,
  };
};

//export const PUBLIC_STATIC_DIR = penv.PUBLIC_STATIC_DIR || path.join(__dirname, '..', 'public');
export default Object.assign({}, penv, {
  VERSION,
  IS_PRODUCTION,
  IS_TEST,
  IS_DEV,
  CONSOLE_LOG,
  HTTP_PORT,
  DB_ADAPTER,
  JWT_SECRET,
  LOCALE,
  jwtConfig,
});

