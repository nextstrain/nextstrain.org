import next from 'next';

import { PRODUCTION } from '../config.js';


const nextApp = next({
  dev: !PRODUCTION,
  hostname: process.env.HOST, // XXX FIXME: Does this actually need to be from the reverse proxy?
  port: Number(process.env.PORT),
});

const prepared = nextApp.prepare();


const _handleRequest = nextApp.getRequestHandler();

export async function handleRequest(req, res) {
  await prepared;
  await _handleRequest(req, res);
  return res.end();
}
