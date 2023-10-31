import React from "react";
import Helmet from "react-helmet";
import { siteTitle } from "../../data/SiteConfig";
import NavBar from "../components/nav-bar";
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import { HugeSpacer } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";

const GenericPage = ({location, children, banner}) => (
  <MainLayout>
    <div className="index-container">
      <Helmet title={siteTitle} />
      <main>
        <UserDataWrapper>
          <NavBar location={location} />
          {banner}
          <splashStyles.Container className="container">
            <HugeSpacer /><HugeSpacer />
            {children}
            <Footer />
          </splashStyles.Container>
        </UserDataWrapper>
      </main>
    </div>
  </MainLayout>
);

export default GenericPage;
