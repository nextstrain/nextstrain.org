import React from "react";
import styled from "styled-components";
import { Router, Redirect } from "@reach/router";
import NavBar from '../components/nav-bar';
import { Logos } from "../components/logos";

class UsersApp extends React.Component {
  state = {
    user: undefined
  }

  // Cannot use async componentDidMount() in current gatsby version
  // see github issue: https://github.com/gatsbyjs/gatsby/issues/3972
  componentDidMount() {
    fetch('/whoami', { headers: { Accept: 'application/json' }})
    .then((response) => response.json())
    .then((user) => this.setState((state) => ({...state, ...user})))
    .catch((error) => console.error("Error: ", error));
  }

  render() {
    return (
      <Router>
        {/* Only redirect to /users/<username> is a user is signed in */}
        {this.state.user && <Redirect from="users" to={`users/${this.state.user.username}`}/>}
        <UserPage path="users/*" user={this.state.user}/>
      </Router>
    );
  }

}

const UserPage = (props) => {
  const { user } = props;

  const LoggedIn = () => (
    <p>
      You&apos;re logged in as <strong>{this.state.user.username}</strong>.<br />
      You have access to the following private Nextstrain groups, which each
      contain a collection of datasets and/or narratives:
      <strong>{this.state.user.groups.join(', ')}</strong>.<br />
      <a href="/logout">Logout</a>
    </p>
  );

  const LoggedOut = () => (
    <p>
      You are not logged in.<br />
      <a href="/login">Login</a>
    </p>
  );

  return (
    <div className="index-container">
      <main>
        <NavBar />
        <UserContainer>
          {user
            ? LoggedIn()
            : LoggedOut()}
        </UserContainer>
        <Logos />
      </main>
    </div>
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
  font-size: 28px;
  font-weight: 300;
  line-height: ${(props) => 1.4 * props.theme.niceLineHeight};
`;

export default UsersApp;
