/* System-defined actions used for authorization.
 */

/* Map from exported property names → symbols that are passed around and used
 * for comparison.  This is sort of like an enum, but without compile-time
 * checks.  Would need TypeScript for true enum support.
 */
const actions = {
  Read: Symbol("authz.actions.Read"),
  Write: Symbol("authz.actions.Write"),
};

// actions.has(x) lookup method
const allValues = new Set(Object.values(actions));

actions.has = action => allValues.has(action);

// Freeze for export so this "can't" be modified by callers.
export default Object.freeze(actions);
