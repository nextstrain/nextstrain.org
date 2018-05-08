import React from "react";
import Link from 'gatsby-link';
import styled from 'styled-components';
import Flex from "../framework/flex";
import { titleColors, darkGrey, brandColor } from "../../util/globals";
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";

const NavContainer = styled(Flex)`
  max-width: 960px;
  margin-top: auto;
  margin-right: auto;
  margin-bottom: auto;
  margin-left: auto;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  left: 0px;
  z-index: 1001;
  transition: left .3s ease-out;
`;

const NavLogo = styled.div`
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 0px;
  padding-bottom: 0px;
  cursor: pointer;
  font-size: ${(props) => props.minified ? '12px' : '16px'};
`;

const NavLogoCharacter = styled.span`
  padding: 0px;
  text-decoration: none;
  font-size: 20px;
  font-weight: 400;
  cursor: pointer;
  color: ${(props) => props.color};
`;

const NavLink = styled(Link)`
  padding-left: ${(props) => props.minified ? '6px' : '12px'};
  padding-right: ${(props) => props.minified ? '6px' : '12px'};
  padding-top: 20px;
  padding-bottom: 20px;
  text-decoration: none !important;
  cursor: pointer;
  font-size: ${(props) => props.minified ? '12px' : '16px'} !important;
  font-weight: 400;
  text-transform: uppercase;
  color: ${(props) => props.color} !important;
`;

const NavLinkInactive = styled.div`
  padding-left: ${(props) => props.minified ? '6px' : '12px'};
  padding-right: ${(props) => props.minified ? '6px' : '12px'};
  padding-top: 20px;
  padding-bottom: 20px;
  text-decoration: none;
  font-size: ${(props) => props.minified ? '12px' : '16px'};
  font-weight: 400;
  text-transform: uppercase;
  color: #5097BA;
`;

class NavBar extends React.Component {

  selectedClass(name) {
    if (!this.props.location || !this.props.location.pathname) return "";
    return this.props.location.pathname.startsWith(`/${name}`);
  }

  getLogo() {
    return (
      <NavLogo>
        <Link to="/">
          <img alt="Logo" width="40" src={nextstrainLogo}/>
        </Link>
      </NavLogo>
    );
  }

  getLogoType() {
    const title = "Nextstrain";
    const rainbowTitle = title.split("").map((letter, i) =>
      <NavLogoCharacter key={i} color={titleColors[i]}>{letter}</NavLogoCharacter>
    );
    return (
      this.props.minified ?
        <div/>
        :
        <Link to="/">
          {rainbowTitle}
        </Link>

    );
  }

  getLink(name, url, selected) {
    const linkCol = this.props.minified ? "#000" : darkGrey;
    return (
      selected ?
        <NavLinkInactive minified={this.props.minified}>
          {name}
        </NavLinkInactive>
        :
        <NavLink to={url} color={linkCol} minified={this.props.minified}>
          {name}
        </NavLink>
    );
  }

  render() {
    return (
      <NavContainer>
        {this.getLogo()}
        {this.getLogoType()}
        <div style={{flex: 5}}/>
        {this.getLink("About", "/about", this.selectedClass("about"))}
        {this.getLink("Docs", "/docs/builds/zika-build", this.selectedClass("docs"))}
        {this.getLink("Posts", "/reports/flu-vaccine-selection/2017-february", this.selectedClass("reports"))}
        <div style={{width: this.props.minified ? 8 : 0 }}/>
      </NavContainer>
    );
  }
}

/* REMOVED HEADERS (these are still available if you know the URL)
{this.getLink("Methods", "/methods/overview/introduction", this.selectedClass("methods"), styles)}
{this.getLink("Blog", "/blog/2018/placeholder", this.selectedClass("blog"), styles)}
{this.getLink("Developer", "/developer/auspice/page-load", this.selectedClass("developer"), styles)}
*/
export default NavBar;
