import React from 'react';
import ReactDOM from 'react-dom/client';

/**
 * This is used to replace a server-side-rendered spinner-like placeholder
 * with JS code executed client-side.
 * In the future we could make a best-effort to render this component server-side
 * and then hydrate it.
 * Currently we ask each client component to call this function, but we could easily
 * remove this by using Rollup's JS API.
 */

export function renderClientSide(Component, domId='client_root') {
  console.log("clientComponent() running. Rendering", Component, "into DOM ID ", domId); // TODO REMOVE
  ReactDOM.createRoot(document.getElementById(domId)).render(
    <React.StrictMode>
      <Component/>
    </React.StrictMode>,
  );
}
