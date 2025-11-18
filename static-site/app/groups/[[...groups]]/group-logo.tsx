"use client";

import React from "react";

import usersIcon from "../../../static/logos/fa-users-solid.svg";

export default function GroupLogo(): React.ReactElement {
  return <img alt="default group logo" height="35px" src={usersIcon.src} />;
}
