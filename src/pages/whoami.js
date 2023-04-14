import { html } from 'htm/react';

import { RootLayout } from '../layouts/index.js';
import { visibleGroups } from '../user.js';

export const Whoami = ({currentUser}) => {
  if (!currentUser) {
    return html`
      <${RootLayout} title="Not logged in">
        <p>
          You’re not logged in.
          (<a href="/login">login</a>)
        </p>
      <//>
    `;
  }

  const privateGroups = visibleGroups(currentUser).filter(g => g.private);

  return html`
    <${RootLayout} title=${`Logged in as ${currentUser.username}`} currentUser=${currentUser}>
      <p>
        You’re logged in as <strong>${currentUser.username}</strong>.
        (<a href="/logout">logout</a>)
      </p>

      <p>
        You have access to the following private Nextstrain groups, which each
        contain a collection of datasets and/or narratives:
      </p>

      <ul>
        ${privateGroups.map(group => html`
          <li key=${group.name}>
            <a href=${`/groups/${group.name}`}>${group.name}</a>
          </li>
        `)}
      </ul>
    <//>
  `;
};
