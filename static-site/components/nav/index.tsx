import React from "react";

import { groupsApp } from "../../data/BaseConfig";
import { useTranslation } from "../../app/i18n";

import NavLogo from "./nav-logo";
import UserOrLoginLink from "./user-or-login-link";
import LanguageSwitcher from "./language-switcher";

import styles from "./styles.module.css";

/** React Server Component to render the site nav bar */
export default async function Nav(): Promise<React.ReactElement> {
  const { t } = await useTranslation();

  return (
    <nav className={styles.nav}>
      {/* because we don't want the logo on the front page, we need to
      encapsulate this so it can be a client side component, and get
      access to pathname() */}
      <NavLogo />

      <div style={{ flex: 5 }} />

      {!groupsApp && (
        <>
          <a href="https://docs.nextstrain.org">DOCS</a>
          <a href="/contact">{t("contact").toUpperCase()}</a>
          <a href="/blog/">BLOG</a>
        </>
      )}
      <UserOrLoginLink />
      <LanguageSwitcher />
    </nav>
  );
}

