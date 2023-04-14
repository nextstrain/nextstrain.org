import { html } from 'htm/react';

import { Nav } from '../components/nav.js';
import { themeCssVars } from '../css.js';


/* The top-level (i.e. root) layout used by pages.  Each page component
 * explicitly wraps its content in a layout component so it can directly pass
 * props (e.g. for use in <head>).  Layouts can be nested as necessary for
 * different sections of the site.
 */
export const RootLayout = ({title, currentUser, children}) => {
  /* XXX TODO: There's a lot more we want here, obviously.  Global page
   * elements, styles, etc.
   *   -trs, 6 April 2023
   */

  return html`
    <!-- <!doctype html> added by React -->
    <html lang="en">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>${title ? `Nextstrain — ${title}` : "Nextstrain"}</title>

        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="me" href="https://mstdn.science/@nextstrain" />
        <meta name="description" content="Real-time tracking of pathogen evolution" />

        <link rel="stylesheet" href="/assets/css/prism.css" />
        <link rel="stylesheet" href="/assets/css/browserCompatibility.css" />
        <link rel="stylesheet" href="/assets/css/bootstrap.css" />
        <style dangerouslySetInnerHTML=${{__html: themeCssVars}} />
        <link rel="stylesheet" href="/assets/css/globals.css" />
        <link rel="stylesheet" href="/assets/css/layout.css" />
        <link rel="stylesheet" href="/assets/css/nav.css" />
      </head>
      <body>
        <${Nav} currentUser=${currentUser} />
        <main class="container">
          ${children}
        </main>
      </body>
    </html>
  `;
};
