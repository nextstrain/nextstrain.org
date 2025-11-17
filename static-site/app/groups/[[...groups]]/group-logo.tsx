"use client";

import React from "react";

import nextstrainLogoSmall from "../../../static/logos/nextstrain-logo-small.png";

export default function GroupLogo(): React.ReactElement {
  return <img alt="nextstrain logo" height="35px" src={nextstrainLogoSmall.src} />;
}
