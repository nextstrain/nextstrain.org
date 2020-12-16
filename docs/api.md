# Data API between clients and nextstrain.org

The main data communications between clients (such as Auspice) and the nextstrain.org server occur at URLs beginning with `https://nextstrain.org/charon`.
Currently the only client accessing these is Auspice (more specifically, a nextstrain.org customised version of Auspice).
For a summary of the requests and responses please see [the auspice server docs](https://docs.nextstrain.org/projects/auspice/en/stable/server/api.html).

> **Charon:** the ferryman of Hades who carries souls across the river Styx that divided the world of the living from the world of the dead. 

## Serverside Handlers

The handlers are attached within `server.js` and are typical [express](https://expressjs.com/en/api.html) callbacks.
Each handler is defined in an file of the same name within `src`.


### Autorization

Each handler is responsable for checking authorization by calling a `Source` class method like so:
```js
if (!source.visibleToUser(req.user)) {
  return helpers.unauthorized(req, res);
}
```

## Tests

There are a number of smoke-tests for these API calls.
See `tests/smoke-test/` for details and run via `npm run smoke-test:ci`