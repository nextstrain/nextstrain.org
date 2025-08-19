import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Splash from "../components/splash";
import { groupsApp } from "../data/BaseConfig";

export const metadata: Metadata = {
  title: "Nextstrain",
};

export default function IndexPage(): React.ReactElement {
  /* see (top-level file) `groupsApp.md` for more information */
  if (groupsApp) {
    // if groupsApp is true, index page redirects to groups page
    redirect("/groups");
  }

  return (
    <>
      <Splash />
    </>
  );
}
