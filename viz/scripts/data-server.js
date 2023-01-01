const argparse = require("argparse");
const path = require('path')
const express = require('express')

function parseArgs() {
  const parser = new argparse.ArgumentParser({
    description: `
      A simple server to serve datasets from <data> at localhost:<port> with 'Access-Control-Allow-Origin: *'.
    `,
  });
  parser.add_argument("--data", {default: "./data"})
  parser.add_argument("--port", {default: 8000})
  return parser.parse_args();
}

async function startServer(args) {
  const app = express()
  const directory = path.join(__dirname, '..', args.data);
  app.set('port', args.port);
  app.use("/", express.static(
    directory,
    {setHeaders: (res, path) => {
      res.set("Access-Control-Allow-Origin", "*");
      console.log(`Serving ${path}`)
    }}
  ));
  const server = await app.listen(app.get('port'));
  console.log(`Ephemeral server running at port ${app.get('port')} serving data from ${directory}`)
  return server;
}

async function main(args) {
  startServer(args);
}

main(parseArgs());

