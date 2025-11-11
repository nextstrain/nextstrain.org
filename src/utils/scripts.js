import { Console } from 'console';
import process from 'process';
import { spawn } from 'child_process';
import { Transform } from 'stream';


/**
 * Set up the global `console` object to prefix all output lines with an
 * indication of the state of *dryRun*.
 *
 * @param {{dryRun: boolean}}
 */
function setupConsole({dryRun = true}) {
  if (!dryRun) return;

  const LinePrefixer = class extends Transform {
    constructor(prefix) {
      super();
      this.prefix = prefix;
    }
    _transform(chunk, encoding, callback) {
      // Prefix the beginning of the string and every internal newline, but not
      // the last trailing newline.
      this.push(chunk.toString().replace(/^|(?<=\n)(?!$)/g, this.prefix));
      callback();
    }
  };

  const stdout = new LinePrefixer("DRY RUN | ");
  const stderr = new LinePrefixer("DRY RUN | ");

  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);

  // eslint-disable-next-line no-global-assign
  console = new Console({stdout, stderr});
}


/**
 * Track promise rejections and report on any still left unhandled at process
 * exit.
 *
 * Replaces the default Node.js behaviour of warning about "unhandled" (but
 * really just potentially unhandled) promise rejections as early as after one
 * turn of the event loop.  This default behaviour is understandable in the
 * context of long-lived apps where process exit is likely far too late to be
 * useful, but not suitable for shorter-lived programs like scripts which may
 * fire off a bunch of simultaenous work with promises and then not check on
 * them until several turns of the event loop later.  In the latter case,
 * waiting until process exit is much better and avoids spurious warnings on
 * Node.js before v15 and errors from v15 onwards.
 *
 * For more details, see:
 *
 *   - https://nodejs.org/api/process.html#event-unhandledrejection
 *   - https://nodejs.org/api/process.html#event-rejectionhandled
 */
function reportUnhandledRejectionsAtExit() {
  const unhandledRejections = new Set();
  process.on("unhandledRejection", (_, promise) => unhandledRejections.add(promise));
  process.on("rejectionHandled", (promise) => unhandledRejections.delete(promise));
  process.on("exit", (code) => {
    if (unhandledRejections.size) {
      const s = unhandledRejections.size === 1 ? "" : "s";
      console.error("\n");
      console.error(`PROGRAMMING ERROR: Caught unhandled rejection${s} of ${unhandledRejections.size} promise${s}:`);
      console.group();
      unhandledRejections.forEach(p => console.error(p));
      console.groupEnd();

      // Preserve exit code unless it's 0
      if (code === 0) process.exitCode = 70; // EX_SOFTWARE from /usr/include/sysexits.h
    }
  });
}


/**
 * Run a command with stdout and stderr sent to `console.log()` and
 * `console.error()`.
 *
 * @param {string[]} argv
 * @returns {Promise<{code, signal, argv}>}
 */
async function run(argv) {
  return new Promise((resolve, reject) => {
    const proc = spawn(argv[0], argv.slice(1), {stdio: ["ignore", "pipe", "pipe"]});

    proc.stdout.on("data", data => console.log(data.toString().replace(/\n$/, "")));
    proc.stderr.on("data", data => console.error(data.toString().replace(/\n$/, "")));

    proc.on("close", (code, signal) => {
      const result = code !== 0 || signal !== null
        ? reject
        : resolve;
      return result({code, signal, argv});
    });
  });
}


export {
  setupConsole,
  reportUnhandledRejectionsAtExit,
  run,
};
