import { html } from 'htm/react';

export const Nav = ({minified, currentUser}) => html`
  <nav className=${minified ? "minified" : ""}>
    <a href="/" className="logo">
      <img alt="Nextstrain (logo)"
           src="/assets/logos/nextstrain-logo-small.png"
           width="40" />
    </a>
    <a href="/" className="wordmark">
      <span>N</span>
      <span>e</span>
      <span>x</span>
      <span>t</span>
      <span>s</span>
      <span>t</span>
      <span>r</span>
      <span>a</span>
      <span>i</span>
      <span>n</span>
    </a>
    <div style=${{flex: 5}} />
    <a href="https://docs.nextstrain.org/page/learn/about-nextstrain.html">Help</a>
    <a href="https://docs.nextstrain.org">Docs</a>
    <a href="/blog/">Blog</a>
    ${
      currentUser
        ? html`
            <a href="/whoami" className="current-user">
              <span role="img" aria-labelledby="userIcon">👤</span>
              ${` ${currentUser.username}`}
            </a>
          `
        : html`<a href="/login">Login</a>`
    }
  </nav>
`;
