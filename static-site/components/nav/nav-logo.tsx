"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

import { groupsApp, siteTitle } from "../../data/BaseConfig";
import logo from "../../static/logos/nextstrain-logo-small.png";

import styles from "./styles.module.css";

/**
 * React Client Component to render the nav bar logo on everything
 * except the home page.
 *
 * Needs to be a client component because of the use of `usePathname()`
 */
export default function NavLogo(): React.ReactElement | null {
  const pathname = usePathname();

  return pathname !== "/" ? (
    <>
      <Logo />
      <LogoType />
    </>
  ) : null;
}

/** React Client Component that renders the Nextstrain logo */
function Logo(): React.ReactElement {
  return (
    <a href="/" className={styles.logo}>
      <Image src={logo} alt="Nextstrain (logo)" width="40" height="40" />
    </a>
  );
}

/** React Client Component that renders the logotype alongside the logo */
function LogoType(): React.ReactElement {
  const rainbowTitle = siteTitle.split("").map((letter, i) => (
    <span key={i} style={{ color: `var(--titleColor${i})` }}>
      {letter}
    </span>
  ));
  const SubTitle = (): React.ReactElement => <div>Groups Server</div>;

  return (
    <div className={styles.responsiveTitle}>
      <a href="/" className={styles.wordmark}>
        {rainbowTitle}
        {groupsApp && <SubTitle />}
      </a>
    </div>
  );
}
