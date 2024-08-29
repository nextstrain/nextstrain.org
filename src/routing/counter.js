import { BadRequest } from "../httpErrors.js";
import { KvNamespace } from "../kv.js";

const kv = new KvNamespace("counter");

export function setup(app) {
  app.routeAsync("/counter")
    .postAsync(async (req, res) => {
      // Validation, authz, etc!
      if (req.body.reset) {
        await kv.set("counter", 0);
      }
      else {
        const n = Number(req.body.n);

        if (!Number.isFinite(n))
          throw BadRequest("not a number");

        // Not atomic!
        await kv.set("counter", (await kv.get("counter") ?? 0) + n);
      }

      return res.redirect("/counter");
    });
}
