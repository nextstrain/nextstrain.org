import React from "react";
import Helmet from "react-helmet";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  render() {
    return (
      <MainLayout>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <main>
            <NavBar location={this.props.location} />
            Placeholder for listing of SARS-CoV-2 situation reports
          </main>
        </div>
      </MainLayout>
    );
  }
}

export default Index;
