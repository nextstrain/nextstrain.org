import React from "react";
import Helmet from "react-helmet";
import { siteTitle, Footer } from "../../data/SiteConfig";
import NavBar from "../components/nav-bar";
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import { BigSpacer, HugeSpacer, Line } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";

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
            <Line style={{ margin: "30px 0px 10px 0px" }} />
            <Footer />
            <BigSpacer />
          </splashStyles.Container>
        </UserDataWrapper>
      </main>
    </div>
  </MainLayout>
);

export default GenericPage;
