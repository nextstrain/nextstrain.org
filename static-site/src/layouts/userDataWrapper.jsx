import React from "react";

export default class UserDataWrapper extends React.Component {
  state = {
    user: undefined,
    visibleGroups: undefined,
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
    const { children } = this.props;
    const childElements = React.Children.map(children, child =>
      // Passes the user state as a prop to all children elements via the prop `user`
      child && React.cloneElement(child, {
        user: this.state.user,
        visibleGroups: this.state.visibleGroups,
      })
    );
    return <div>{ childElements }</div>;
  }
}
