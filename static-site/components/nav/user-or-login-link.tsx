"use client";

import React, { useContext } from "react";

import { UserContext } from "../user-data-wrapper";

/*
 * React Client Component that renders the LOGIN button or the name of
 * the actively logged in user, when there is an actively logged in
 * user
 *
 * Needs to be a client component because of the use of `useContext`
 */
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
