import { html } from 'htm/react';

/**
 * TODO XXX - this could be a spinner or some way to indicate that content is loading
 */
export function ClientComponentPlaceholder({domId='client_root'}) {
  return html`
    <div id=${domId}>
    </div>
  `;
}
