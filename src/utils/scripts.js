const process = require("process");


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


module.exports = {
  reportUnhandledRejectionsAtExit,
};
