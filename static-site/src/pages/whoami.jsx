import React, {Fragment, useContext} from "react";
import styled from "styled-components";
import UserDataWrapper, { UserContext } from "../layouts/userDataWrapper";
import NavBar from '../components/nav-bar';
import { Logos } from "../components/logos";
import MainLayout from "../components/layout";

const UserPage = () => {
  const { user, groupMemberships } = useContext(UserContext);

  const LoggedIn = () => (
    <Fragment>
      You&apos;re logged in as <strong>{user.username}</strong>.
      <SubText>
        You are a member of the following Nextstrain groups, which each
        contain a collection of datasets and/or narratives:
      </SubText>

      Public:

      <UserGroupsList>
        {groupMemberships.filter((group) => group.isPublic).map((group) => (
          <li key={group.name}>
            <a href={`/groups/${group.name}`}>{group.name}</a>
          </li>
        ))}
      </UserGroupsList>

      Private:

      <UserGroupsList>
        {groupMemberships.filter((group) => !group.isPublic).map((group) => (
          <li key={group.name}>
            <a href={`/groups/${group.name}`}>{group.name}</a>
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
  console.log("<Users>");
  return (
    <MainLayout>
      <div className="index-container">
        <main>
          <UserDataWrapper>
            <NavBar />
            <UserPage/>
            <Logos />
          </UserDataWrapper>
        </main>
      </div>
    </MainLayout>
  );
};

export default Users;
