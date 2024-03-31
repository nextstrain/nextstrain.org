import next from 'next';
import { STATIC_SITE_PRODUCTION } from '../config.js';
import {verbose} from '../utils/index.js';

const PORT = Number(process.env.PORT || 5000);

const nextJsApp = next({dev: !STATIC_SITE_PRODUCTION, port: PORT, dir: './static-site'})
const prepared = nextJsApp.prepare();
const _handleRequest = nextJsApp.getRequestHandler();

export async function handleRequest(req, res) {
  if (!req.path.startsWith('/_next/')) {
    verbose(`next.js handling request for "${req.path}"`)
  }
  await prepared;
  await _handleRequest(req, res);
  return res.end();
}