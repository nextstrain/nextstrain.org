import React from "react";
import Head from "next/head";
import { withRouter } from 'next/router'
import SEO from "../components/SEO/SEO";
import { siteTitle, groupsApp } from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import Splash from "../components/splash";
import UserDataWrapper from "../layouts/userDataWrapper";
import MainLayout from "../components/layout";

class Index extends React.Component {
  render() {

    if (groupsApp) { /* see (top-level file) `groupsApp.md` for more */
      this.props.router.replace("/groups")
      return null;
    }

    return (
      <MainLayout>
        <div className="index-container">
          <Head>
            <title>{siteTitle}</title>
          </Head>
          <SEO/>
          <main>
            <UserDataWrapper>
              <NavBar/>
              <Splash/>
            </UserDataWrapper>
          </main>
        </div>
      </MainLayout>
    );
  }
}

export default withRouter(Index);
