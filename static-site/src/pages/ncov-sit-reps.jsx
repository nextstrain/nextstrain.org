import React from "react";
import Helmet from "react-helmet";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import { FlexCenter } from "../layouts/generalComponents";
import * as Styles from "../components/splash/styles";

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {

  componentDidMount() {
    fetch(`/charon/getAvailable`)
      .then((res) => res.json())
      .then((json) => {
        const narratives = json.narratives
          .map((o) => "/"+o.request)
          .filter((o) => o.startsWith("/narratives/ncov/sit-rep/"));
        this.setState({ narratives });
      });
    // todo: graceful error handling
  }

  render() {
    return (
      <MainLayout>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <main>
            <NavBar location={this.props.location} />

            {this.state && this.state.narratives ? (
              <FlexCenter>
                <Styles.CenteredFocusParagraph>
                  All ncov situation reports:

                  {this.state.narratives.map((url) => {
                    // here we're relying on the URLs all adhering to an unspoken scheme
                    // todo: make this more robust (catch errors)
                    const parts = url.replace("/narratives/ncov/sit-rep/", "").split("/");
                    let name;
                    if (parts.length === 1) {
                      name = parts[0];
                    } else if (parts.length === 2) {
                      name = `${parts[1]} (${parts[0].toUpperCase()})`;
                    } else {
                      console.warn("Unforseen narrative url", url);
                      return null;
                    }
                    return (<p><a href={url}>{name}</a></p>);
                  })}

                </Styles.CenteredFocusParagraph>
              </FlexCenter>
            ) : null}

          </main>
        </div>
      </MainLayout>
    );
  }
}

export default Index;
