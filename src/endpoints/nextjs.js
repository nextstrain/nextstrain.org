import next from 'next';
import { PRODUCTION } from '../config.js';

const PORT = Number(process.env.PORT || 5000);

const nextJsApp = next({dev: !PRODUCTION, port: PORT, dir: './static-site'})
const prepared = nextJsApp.prepare();
const _handleRequest = nextJsApp.getRequestHandler();

export async function handleRequest(req, res) {
  await prepared;
  await _handleRequest(req, res);
  return res.end();
}