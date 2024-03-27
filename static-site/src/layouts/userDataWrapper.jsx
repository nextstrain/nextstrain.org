import React from "react";

export const UserContext = React.createContext();

export default class UserDataWrapper extends React.Component {
  state = {
    user: undefined,
    visibleGroups: undefined,
    groupMemberships: undefined,
  }

  componentDidMount() {
    this.loadUser();
  }

  loadUser() {
    console.log("Fetching user data");
    fetch("/whoami", { headers: { Accept: 'application/json' }})
      .then((response) => response.json())
      .then((whoami) => this.setState((state) => ({...state, ...whoami})));
  }

  render() {
    return (
      <UserContext.Provider value={this.state}>
        {this.props.children}
      </UserContext.Provider>);
  }
}
