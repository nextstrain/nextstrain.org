import { html } from 'htm/react';

/* The top-level (i.e. root) layout used by pages.  Each page component
 * explicitly wraps its content in a layout component so it can directly pass
 * props (e.g. for use in <head>).  Layouts can be nested as necessary for
 * different sections of the site.
 */
export const RootLayout = ({title, children}) => {
  /* XXX TODO: There's a lot more we want here, obviously.  Global page
   * elements, styles, etc.
   *   -trs, 6 April 2023
   */

  return html`
    <!-- <!doctype html> added by React -->
    <html>
      <head>
        <title>${title ? `Nextstrain — ${title}` : "Nextstrain"}</title>
      </head>
      <body>
        ${children}
      </body>
    </html>
  `;
};
