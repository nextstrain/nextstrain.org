import React, {Fragment} from "react";
import styled from "styled-components";
import UserDataWrapper from "../layouts/userDataWrapper";
import NavBar from '../components/nav-bar';
import { Logos } from "../components/logos";

const UserPage = (props) => {
  const { user } = props;

  const LoggedIn = () => (
    <Fragment>
      You&apos;re logged in as <strong>{user.username}</strong>.
      <SubText>
        You have access to the following private Nextstrain groups, which each
        contain a collection of datasets and/or narratives:
      </SubText>

      <UserGroupsList>
        {user.visibleGroups.map((group) => (
          <li>
            <a href={`/groups/${group}`}>{group}</a>
          </li>
        ))}
      </UserGroupsList>
      <a href="/logout">Logout</a>
    </Fragment>
  );

  const LoggedOut = () => (
    <p>
      You are not logged in.<br />
      <a href="/login">Login</a>
    </p>
  );

  return (
    <UserContainer>
      {user
        ? LoggedIn()
        : LoggedOut()
      }
    </UserContainer>
  );
};

const UserContainer = styled.div`
  max-width: 640px;
  padding: 130px 0px 80px 0px;
  margin-top: 0px;
  margin-right: auto;
  margin-bottom: 0px;
  margin-left: auto;
  text-align: center;
  font-size: 24px;
  font-weight: 300;
  line-height: ${(props) => 1.4 * props.theme.niceLineHeight};
`;

const SubText = styled.p`
  line-height: ${(props) => props.theme.niceLineHeight};
  font-size: 18px;
`;

const UserGroupsList = styled.ul`
  display: table;
  margin: 0 auto !important;
`;

const Users = () => {
  return (
    <div className="index-container">
      <main>
        <UserDataWrapper>
          <NavBar />
          <UserPage/>
          <Logos />
        </UserDataWrapper>
      </main>
    </div>
  );
};

export default Users;
