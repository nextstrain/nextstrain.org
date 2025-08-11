"use client";

import React, { createContext } from "react";

type User = {
  username: string;
};

type Group = {
  isPublic: boolean;
  name: string;
  private: boolean;
};

type UserState = {
  user: null | User;
  visibleGroups: undefined | Group[],
  groupMemberships: Group[];
};

const initialState: UserState = {
  user: null,
  visibleGroups: undefined,
  groupMemberships: [],
};

export const UserContext = createContext(initialState);

/** React Client Component that wraps up tracking of logged-in user state */
export default class UserDataWrapper extends React.Component<
  { children: React.ReactNode },
  UserState
> {
  override state = initialState;

  override componentDidMount(): void {
    this.loadUser();
  }

  async loadUser(): Promise<void> {
    const response = await fetch("/whoami", {
      headers: { Accept: "application/json" },
    });

    const whoami: UserState = await response.json();

    this.setState((state) => ({ ...state, ...whoami }));
  }

  override render(): React.ReactNode {
    return (
      <UserContext.Provider value={this.state}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}
