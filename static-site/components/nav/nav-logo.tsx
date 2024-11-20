"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

import { groupsApp, siteTitle } from "../../data/BaseConfig";
import logo from "../../static/logos/nextstrain-logo-small.png";

import styles from "./styles.module.css";

export default function NavLogo(): React.ReactElement | null {
  const pathname = usePathname();

  return pathname !== "/" ? (
    <>
      <Logo />
      <LogoType />
    </>
  ) : null;
}

const Logo = (): React.ReactElement => (
  <a href="/" className={styles.logo}>
    <Image src={logo} alt="Nextstrain (logo)" width="40" height="40" />
  </a>
);

const LogoType = (): React.ReactElement => {
  const rainbowTitle = siteTitle
    .split("")
    .map((letter, i) => (
      <span key={i} style={{ color: `var(--titleColor${i})` }}>{letter}</span>
    ));
  const SubTitle = (): React.ReactElement => (
    <div>Groups Server</div>
  );

  return (
    <a href="/" className={styles.wordmark}>
      {rainbowTitle}
      {groupsApp && <SubTitle />}
    </a>
  );
};
