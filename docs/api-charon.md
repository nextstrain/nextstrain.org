# Charon API

The main data communications between clients (such as Auspice) and the nextstrain.org server occur at URLs beginning with `https://nextstrain.org/charon`.
Currently the only client accessing these is Auspice (more specifically, a nextstrain.org customised version of Auspice).
For a summary of the requests and responses please see [the auspice server docs](https://docs.nextstrain.org/projects/auspice/en/stable/server/api.html).

> **Charon:** the ferryman of Hades who carries souls across the river Styx that divided the world of the living from the world of the dead. 

## Serverside Handlers

The handlers are attached within `server.js` and are typical [express](https://expressjs.com/en/api.html) callbacks.
Each handler is defined in an file of the same name within `src`.


### Authorization

Each handler is responsible for checking authorization:
```js
authz.assertAuthorized(req.user, authz.actions.Read, source);
```

## Tests

There are a number of tests for these API calls.
See `test/auspice_client_requests.test.js` for details and run via `npm run test:ci`
