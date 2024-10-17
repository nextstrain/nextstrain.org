"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactElement } from "react";

import { groupsApp, siteTitle } from "../../data/BaseConfig";
import logo from "../../static/logos/nextstrain-logo-small.png";

export default function NavLogo(): ReactElement | null {
  const pathname = usePathname();

  return pathname !== "/" ? (
    <>
      <Logo />
      <LogoType />
    </>
  ) : null;
}

const Logo = (): ReactElement => (
  <a href="/" className="logo">
    <Image src={logo} alt="Nextstrain (logo)" width="40" />
  </a>
);

const LogoType = (): ReactElement => {
  const rainbowTitle = siteTitle
    .split("")
    .map((letter, i) => (
      <span key={i} style={{ color: "var(--titleColor" + i + ")" }}>{letter}</span>
    ));
  const SubTitle = (): ReactElement => (
    <div className="wordmark-subtitle">Groups Server</div>
  );

  return (
    <a href="/" className="wordmark">
      {rainbowTitle}
      {groupsApp && <SubTitle />}
    </a>
  );
};
