import React from "react";
import {Link} from 'gatsby';
import styled from 'styled-components';
import { startsWith } from "lodash";
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 960px;
  height: 50px;
  margin-top: auto;
  margin-right: auto;
  margin-bottom: auto;
  margin-left: auto;
  overflow: hidden;
  left: 0px;
  z-index: 1001;
  transition: left .3s ease-out;
`;

const NavLogo = styled.div`
  padding-left: 8px;
  padding-right: 2px;
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
  color: ${(props) => {
    // TODO -- the theme is not available as a prop for some reason
    // return props.theme.titleColors[props.colorIndex];
    return "black";
  }};
`;

const NavLink = styled((props) => <Link {...props} />)`
  padding-left: ${(props) => props.minified ? '6px' : '12px'};
  padding-right: ${(props) => props.minified ? '6px' : '12px'};
  padding-top: 20px;
  padding-bottom: 20px;
  text-decoration: none !important;
  cursor: pointer;
  font-size: ${(props) => props.minified ? '12px' : '16px'} !important;
  font-weight: 400;
  color: ${(props) => props.minified ? '#000000' : props.theme.darkGrey} !important;
`;

const NavLinkActive = styled.div`
  padding-left: ${(props) => props.minified ? '6px' : '12px'};
  padding-right: ${(props) => props.minified ? '6px' : '12px'};
  padding-top: 20px;
  padding-bottom: 20px;
  text-decoration: none;
  font-size: ${(props) => props.minified ? '12px' : '16px'};
  font-weight: 400;
  color: ${(props) => props.theme.brandColor};
`;

class NavBar extends React.Component {
  selectedClass(name) {
    if (!this.props.location || !this.props.location.pathname) return "";
    return startsWith(this.props.location.pathname, `/${name}`); // can't run this.props.location.pathname.startsWith(`/${name}`) on IE
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
      // eslint-disable-next-line react/no-array-index-key
      <NavLogoCharacter key={i} colorIndex={i}>{letter}</NavLogoCharacter>
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
    return (
      selected ?
        <NavLinkActive minified={this.props.minified ? 1 : 0}>
          {name}
        </NavLinkActive>
        :
        <NavLink to={url} minified={this.props.minified ? 1 : 0}>
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
        {this.getLink("DOCS", "/docs", this.selectedClass("docs"))}
        {this.getLink("BLOG", "/blog", this.selectedClass("blog"))}
        {this.props.user
          ? this.getLink(`👤 ${this.props.user.username}`, "/whoami")
          : this.getLink("LOGIN", "/login", this.selectedClass("login"))}
        <div style={{width: this.props.minified ? 12 : 0 }}/>
      </NavContainer>
    );
  }
}

// include this as part of navbar when help page is complete on static
// {this.getLink("Help", "/help", styles)}

export default NavBar;
