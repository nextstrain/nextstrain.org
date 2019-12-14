import React from "react";
import styled from "styled-components";
import NavBar from '../components/nav-bar';
import { Logos } from "../components/logos";
import withLocation from "../templates/withLocation";

const UsersPage = ({ search }) => {
  const { user, groups } = search;
  console.log(search);
  return (
    <div className="index-container">
      <main>
        <NavBar minified/>
        <UserContainer>
          {!!user
            ? <LoggedIn search={search} />
            : <LoggedOut />}
        </UserContainer>
        <Logos />
      </main>
    </div>
  );
};

const LoggedIn = (props) => (
  <p>
    You&apos;re logged in as <strong>{props.search.user}</strong>.<br />
    You are in the groups <strong>{props.search.groups.split(',').join(', ')}</strong>.<br />
    <a href="/logout">Logout</a>
  </p>
);

const LoggedOut = () => (
  <p>
    You are not logged in.<br />
    <a href="/login">Login</a>
  </p>
);

const UserContainer = styled.div`
  max-width: 640px;
  padding: 130px 0px 80px 0px;
  margin-top: 0px;
  margin-right: auto;
  margin-bottom: 0px;
  margin-left: auto;
  text-align: center;
  font-size: 28px;
  font-weight: 300;
  line-height: ${(props) => 1.4 * props.theme.niceLineHeight};
`;

export default withLocation(UsersPage);
