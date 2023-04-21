import Image from "next/image";
import logo from "../../static-site/static/logos/nextstrain-logo-small.png";

import { getCurrentUser } from "../user.js";

import "./nav.scss";


export default async function Nav({minified}) {
  const currentUser = await getCurrentUser();

  return (
    <nav className={minified ? "minified" : ""}>
      <a href="/" className="logo">
        <Image src={logo} alt="Nextstrain (logo)" width="40" />
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
      <div style={{flex: 5}} />
      <a href="https://docs.nextstrain.org/page/learn/about-nextstrain.html">Help</a>
      <a href="https://docs.nextstrain.org">Docs</a>
      <a href="/blog/">Blog</a>
      {
        currentUser
          ? <a href="/whoami" className="current-user">
              <span role="img" aria-labelledby="userIcon">👤</span>
              {` ${currentUser.username}`}
            </a>
          : <a href="/login">Login</a>
      }
    </nav>
  );
}
