"use client";

// Because we don't want to show the footer version of the team list
// on the team page, this component needs access to the pathname, so
// it can decide whether or not to show the list in the footer --
// which means it needs to be a client component.

import { usePathname } from "next/navigation";
import React from "react";

import { MediumSpacer } from "../../src/layouts/generalComponents";
import { FooterTeamList } from "../people/avatars";

export default function TeamList() {
  const pathname = usePathname();

  if (pathname?.match(/team\/?$/)) {
    return <></>;
  }

  return (
    <>
      <MediumSpacer />
      The core Nextstrain team is
      <div style={{ margin: "0px 0px" }} />
      <FooterTeamList />
      Please see the <a href="/team">team page</a> for more details.
    </>
  );
}
