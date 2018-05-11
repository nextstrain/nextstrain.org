import React from "react";
import Link from 'gatsby-link';
import styled from 'styled-components';
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
  color: ${(props) => props.theme.titleColors[props.colorIndex]};
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
  text-transform: uppercase;
  color: ${(props) => props.theme.brandColor};
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
        <NavLinkActive minified={this.props.minified}>
          {name}
        </NavLinkActive>
        :
        <NavLink to={url} minified={this.props.minified}>
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
        {this.getLink("Docs", "/docs", this.selectedClass("docs"))}
        {this.getLink("Tutorial", "/tutorial", this.selectedClass("tutorial"))}
        {this.getLink("Blog", "/blog", this.selectedClass("blog"))}
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
