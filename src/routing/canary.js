const CANARY_ORIGIN = process.env.CANARY_ORIGIN;

import * as utils from '../utils/index.js';


export function setup(app) {
  app.use((req, res, next) => {
    if (CANARY_ORIGIN) {
      const notCanary = req.context.origin !== CANARY_ORIGIN;
      const wantsCanary = req.user?.flags?.has("canary");

      if (notCanary && wantsCanary && req.context.authnWithSession) {
        const canaryUrl = new URL(req.originalUrl, CANARY_ORIGIN);

        utils.verbose(`Redirecting ${req.user.username} to canary <${canaryUrl}>`);

        // 307 Temporary Redirect preserves request method, unlike 302 Found.
        return res.redirect(307, canaryUrl.toString());
      }
    }
    return next();
  });
}
