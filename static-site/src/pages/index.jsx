import React from "react";
import { withRouter } from 'next/router'
import GenericPage from '../layouts/generic-page';
import { groupsApp } from "../../data/SiteConfig";
import Splash from "../components/splash";

class Index extends React.Component {
  render() {

    if (groupsApp) { /* see (top-level file) `groupsApp.md` for more */
      this.props.router.replace("/groups")
      return null;
    }

  // FIXME: add back SEO
    return (
      <GenericPage location={this.props.location}>
        <Splash/>
      </GenericPage>
    );
  }
}

export default withRouter(Index);
