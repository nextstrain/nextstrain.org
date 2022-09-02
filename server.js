import argparse from 'argparse';
import http from 'http';
import * as utils from './src/utils/index.js';

const version = utils.getGitHash();
const nextstrainAbout = `
  Nextstrain is an open-source project to harness the scientific and public
  health potential of pathogen genome data.

  This is the server behind nextstrain.org.
  See https://github.com/nextstrain/nextstrain.org for more.
`;
const parser = new argparse.ArgumentParser({
  version,
  addHelp: true,
  description: `Nextstrain.org server version ${version}`,
  epilog: nextstrainAbout
});
parser.addArgument('--verbose', {action: "storeTrue", help: "verbose server logging"});
const args = parser.parseArgs();
global.verbose = args.verbose;

const port = process.env.PORT || 5000;

/* Import app after setting global.verbose so that calls to utils.verbose()
 * respect our --verbose option as expected.
 */
import app from './src/app.js';

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
    console.log("  -------------------------------------------------------------------------");
    console.log(nextstrainAbout);
    console.log(`  Server listening on port ${server.address().port}`);
    console.log(`  Accessible at https://nextstrain.org or http://localhost:${server.address().port}`);
    console.log(`  Server is running in ${app.locals.production ? 'production' : 'development'} mode`);
    console.log("\n  -------------------------------------------------------------------------\n\n");
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
