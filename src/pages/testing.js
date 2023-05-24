import { html } from 'htm/react';
import { RootLayout } from '../layouts/index.js';
import { ClientComponentPlaceholder } from "../components/clientComponentPlaceholder.js";

/**
 * An example of a Page to be rendered server-side with one (or more) client-side
 * components. Render a <ClientComponentPlaceholder> component in this
 * code and define the path of the client-side component on the `clientComponent`
 * property of the exported function / class.
 */
const Testing = ({currentUser}) => {
  return html`
    <${RootLayout} title="Test page">
      <p>
      This is a test page to show how to use client-side code within a server-rendered Page.
      This text is rendered server-side, as is the nav bar, but the counter below is rendered client-side.
      </p>

      <${ClientComponentPlaceholder}/>

      <p>
      More content rendered server side, e.g. footer
      </p>
    <//>
  `;
};

/**
 * Currently this only allows a single component -- probably fine for now
 * but there are ways to use multiple components, each taking control over
 * a separate DOM element.
 */
Testing.clientComponent = 'counter.js'; // must be the filename relative to `src/client-components`

export {Testing};
