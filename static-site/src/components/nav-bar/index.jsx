import React from "react";
import {Link} from 'gatsby';
import styled, {css} from 'styled-components';
import { startsWith } from "lodash";
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";
import { UserContext } from "../../layouts/userDataWrapper";

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
    try {
      return props.theme.titleColors[props.colorIndex];
    } catch (err) {
      console.log("ERROR in props.", props);
      return "black";
    }
  }};
`;

const baseLinkCss = css`
  padding-left: ${(props) => props.minified ? '6px' : '12px'};
  padding-right: ${(props) => props.minified ? '6px' : '12px'};
  padding-top: 20px;
  padding-bottom: 20px;
  text-decoration: none !important;
  font-size: ${(props) => props.minified ? '12px' : '16px'} !important;
  font-weight: 400;
`;

/** Link which, if relative, will have event handlers attached by gatsby.
 * This means it _won't_ be seen by the server!
 */
const NavLinkToBeHandledByGatsby = styled((props) => <Link {...props} />)`
  ${baseLinkCss}
  color: ${(props) => props.minified ? '#000000' : props.theme.darkGrey} !important;
  cursor: pointer;
`;

/** Link which shouldn't have any event handlers attached by gatsby. This means it'll go to the server
 * even if it's a relative link, which is essential for some functionality, but can cause
 * a page flash
 */
const NavLinkToGoToServer = styled.a`
  ${baseLinkCss}
  color: ${(props) => props.minified ? '#000000' : props.theme.darkGrey} !important;
  cursor: pointer;
`;

/* Looks like a nav link but can't be clicked */
const NavLinkInactive = styled.div`
  ${baseLinkCss}
  color: ${(props) => props.theme.brandColor};
`;

class NavBar extends React.Component {
  static contextType = UserContext;

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

  render() {
    const minified = this.props.minified ? 1 : 0;
    return (
      <NavContainer>
        {this.getLogo()}
        {this.getLogoType()}
        <div style={{flex: 5}}/>
        <NavLinkToGoToServer minified={minified} href="https://docs.nextstrain.org/en/latest/learn/about-nextstrain.html" >HELP</NavLinkToGoToServer>
        <NavLinkToGoToServer minified={minified} href="https://docs.nextstrain.org/en/latest/index.html" >DOCS</NavLinkToGoToServer>
        { /* Only display "blog" if we're not minified */
          minified ?
            null :
            this.selectedClass("blog") ?
              <NavLinkInactive minified={minified}>BLOG</NavLinkInactive> :
              <NavLinkToBeHandledByGatsby minified={minified} to="/blog">BLOG</NavLinkToBeHandledByGatsby>
        }
        {this.context.user ? (
          <NavLinkToGoToServer minified={minified} href="/whoami">
            <span role="img" aria-labelledby="userIcon">👤</span>
            {` ${this.context.user.username}`}
          </NavLinkToGoToServer>
        ) :
          <NavLinkToGoToServer minified={minified} href="/login">LOGIN</NavLinkToGoToServer>
        }
        <div style={{width: this.props.minified ? 12 : 0 }}/>
      </NavContainer>
    );
  }
}

// include this as part of navbar when help page is complete on static
// {this.getLink("Help", "/help", styles)}

export default NavBar;
