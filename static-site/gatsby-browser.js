export function onClientEntry() {
  if (typeof fetch === 'undefined') {
    require('whatwg-fetch'); // eslint-disable-line global-require
  }
}
