"use client";

import React, { useContext } from "react";

import { UserContext } from "../user-data-wrapper";

export default function UserOrLoginLink(): React.ReactElement {
  const { user } = useContext(UserContext);
  return user ? (
    <a href="/whoami">
      <span role="img" aria-labelledby="userIcon">
        👤
      </span>
      {` ${user.username}`}
    </a>
  ) : (
    <a href="/login">LOGIN</a>
  );
}
