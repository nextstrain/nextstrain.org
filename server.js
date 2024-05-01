import argparse from 'argparse';
import http from 'http';
import * as utils from './src/utils/index.js';
import { nextstrainAbout, startupMessage } from './src/startupMessage.js';

const parser = new argparse.ArgumentParser({
  addHelp: true,
  description: `Nextstrain.org server`,
  epilog: nextstrainAbout
});
parser.addArgument('--verbose', {action: "storeTrue", help: "verbose server logging"});
parser.addArgument('--app', {defaultValue: "./src/app.js", help: "File which exports the Express application to serve (i.e. the entrypoint)."});
const args = parser.parseArgs();
global.verbose = args.verbose;

const port = process.env.PORT || 5000;

/* Import app after setting global.verbose so that calls to utils.verbose()
 * respect our --verbose option as expected.
 */
const {default: app} = await import(args.app);

app.set("port", port);

const server = http
  .createServer({
    ServerResponse: class ServerResponse extends http.ServerResponse {
      /**
       * Sets res.wroteContinue so later handlers can know if res.writeContinue()
       * was called already.  The standard parent class tracks this already, but
       * only in an internal property.
       */
      writeContinue() {
        super.writeContinue();
        this.wroteContinue = true;
      }
    },
  })
  .on("request", app)
  .on("checkContinue", (req, res) => {
    /* When this event fires, the normal "request" event that calls app is not
     * fired.
     *
     * Endpoints that receive request bodies (PUT, POST, etc) will check the
     * req.expectsContinue property to see if they should call
     * res.writeContinue() at an appropriate point.
     */
    req.expectsContinue = true;
    return app(req, res);
  })
  .on("listening", () => {
    utils.log(`Server now listening on port ${server.address().port} (startup message will appear shortly)`);
    startupMessage(server, app)
  })
  .on("error", (err) => {
    if (err.code === 'EADDRINUSE') {
      utils.error(`Port ${app.get('port')} is currently in use by another program.
      You must either close that program or specify a different port by setting the shell variable
      "$PORT". Note that on MacOS / Linux, "lsof +c0 -n -i :${app.get('port')} | grep LISTEN" should
      identify the process currently using the port.`);
    }
    utils.error(`Uncaught error in app.listen(). Code: ${err.code}`);
  })
;

server.listen(port);
