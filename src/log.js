import { CONSOLE_LOG } from './config';

export function logResponse (response) {
  logDebug('RESPONSE: ' + JSON.stringify(response));
  return response;
}

export function logErr (err) {
  const errSimple = JSON.parse(JSON.stringify(err));// avoid side-effects on objects
  delete errSimple.options;
  if (errSimple.response) {
    delete errSimple.response.connection;
    delete errSimple.response.headers;
    delete errSimple.response.rawHeaders;
    delete errSimple.response.client;
    delete errSimple.response.req;
  }
  logDebug('ERR: ', errSimple);
  throw err;// * * *
}

export function logDebug(...args) {
  if (CONSOLE_LOG) {
    console.log(' ');
    console.log.apply(null, args);
    console.log(' ');
  }
}
