/**
 * Request-scoped global context.
 *
 * @module requestContext
 */

import { AsyncLocalStorage } from 'node:async_hooks';

const kRequestContextStorage = Symbol.for("nextstrain.org request context storage");


/**
 * XXX FIXME
 */
const storage = (global[kRequestContextStorage] ??= new AsyncLocalStorage()); // eslint-disable-line no-multi-assign


/**
 * XXX FIXME
 */
export function bindRequestContext(ctx, fn) {
  return storage.run.bind(storage, ctx, fn);
}


/**
 * XXX FIXME
 */
export function getRequestContext() {
  const context = storage.getStore();
  if (!context) throw new Error("Request context not available in this stack!");
  return context;
}
