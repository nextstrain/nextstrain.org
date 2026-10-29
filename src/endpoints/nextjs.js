import next from 'next';
import { SERVER_MODE } from '../config.js';
import {verbose, error} from '../utils/index.js';

const PORT = Number(process.env.PORT || 5000);

const nextJsApp = next({dev: SERVER_MODE === "development", port: PORT, dir: './static-site'})
const prepared = nextJsApp.prepare()
  .catch((err) => {
    if (SERVER_MODE !== "development" && String(err).startsWith('Error: ENOENT: no such file or directory')) {
      error(`To run the next.js site in production mode it needs to be built via 'npm run build' or 'npx next build static-site'`);
    }
    throw err; // will print stack trace & is fatal for the server
  })
const _handleRequest = nextJsApp.getRequestHandler();

export async function handleRequest(req, res) {
  if (!req.path.startsWith('/_next/')) {
    verbose(`next.js handling request for "${req.path}"`)
  }
  await prepared;
  await _handleRequest(req, res);
  return res.end();
}