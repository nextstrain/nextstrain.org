import React from "react";
import withLocation from "../templates/withLocation";

const UsersPage = ({ search }) => {
  const { user, groups } = search;
  console.log(search);
  return (
    !!user
      ? <LoggedIn search={search} />
      : <LoggedOut />
  );
};

const LoggedIn = (props) => (
  <p>
    You&apos;re logged in as <strong>{props.search.user}</strong>.<br />
    You are in the groups <strong>{props.search.groups}</strong>.<br />
    <a href="/logout">Logout</a>
  </p>
);

const LoggedOut = () => (
  <p>
    You are not logged in.<br />
    <a href="/login">Login</a>
  </p>
);

export default withLocation(UsersPage);
