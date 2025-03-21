"use client";

import React, { useContext } from "react";

import { UserContext } from "../../components/user-data-wrapper";

import styles from "./styles.module.css";

// we don't export a metadata object here because react client
// components aren't allowed to do that, and we need to be a client
// component to get access to the user context

/**
 * A React Client Component that renders the /whoami page
 */
export default function WhoAmI(): React.ReactElement {
  const { user, groupMemberships } = useContext(UserContext);

  return user ? (
    <div className={styles.userContainer}>
      You’re logged in as <strong>{user.username}</strong>.
      <p className={styles.subText}>
        You are a member of the following Nextstrain groups, which each contain
        a collection of datasets and/or narratives:
      </p>
      Public:
      <ul className={styles.userGroupList}>
        {groupMemberships
          .filter((group) => group.isPublic)
          .map((group) => (
            <li key={group.name}>
              <a href={`/groups/${group.name}`}>{group.name}</a>
            </li>
          ))}
      </ul>
      Private:
      <ul className={styles.userGroupList}>
        {groupMemberships
          .filter((group) => !group.isPublic)
          .map((group) => (
            <li key={group.name}>
              <a href={`/groups/${group.name}`}>{group.name}</a>
            </li>
          ))}
      </ul>
      <a href="/logout">Logout</a>
    </div>
  ) : (
    <div className={styles.userContainer}>
      <p>
        You are not logged in.
        <br />
        <a href="/login">Login</a>
      </p>
    </div>
  );
}
