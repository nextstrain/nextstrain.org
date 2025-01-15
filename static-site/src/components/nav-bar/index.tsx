import React, { useContext } from "react";
import Router from 'next/router';
import styled, {css} from 'styled-components';
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";
import { UserContext } from "../../layouts/userDataWrapper";
import { groupsApp } from "../../../data/SiteConfig";

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  margin-top: auto;
  margin-right: auto;
  margin-bottom: auto;
  margin-left: auto;
  overflow: hidden;
  left: 0px;
  z-index: 1001;
  transition: left .3s ease-out;

  // TODO: Put this component in a container which sets these styles for all pages.
  // This isn't trivial with the current split in page-level components.
  @media (min-width: 768px) {
    max-width: 728px;
  }
  @media (min-width: 992px) {
    max-width: 952px;
  }
  @media (min-width: 1200px) {
    max-width: 1150px;
  }
  @media (min-width: 1550px) {
    max-width: 1500px;
  }
`;

const NavLogo = styled.div<{ $minified?: boolean }>`
  padding-left: 8px;
  padding-right: 2px;
  padding-top: 0px;
  padding-bottom: 0px;
  cursor: pointer;
  font-size: ${(props) => props.$minified ? '12px' : '16px'};
`;

const NavLogoCharacter = styled.span<{ $colorIndex: number }>`
  padding: 0px;
  text-decoration: none;
  font-size: 20px;
  font-weight: 400;
  cursor: pointer;
  color: ${(props) => props.theme.titleColors?.[props.$colorIndex]};
`;

const baseLinkCss = css<{ $minified?: boolean }>`
  padding-left: ${(props) => props.$minified ? '6px' : '12px'};
  padding-right: ${(props) => props.$minified ? '6px' : '12px'};
  padding-top: 20px;
  padding-bottom: 20px;
  text-decoration: none !important;
  font-size: ${(props) => props.$minified ? '12px' : '16px'} !important;
  font-weight: 400;
`;

/** HTML anchor (<a>) element. HTML request will be made to server, i.e. won't be handled client-side.
 */
const ServerSideLink = styled.a<{ $minified?: boolean }>`
  ${baseLinkCss}
  color: ${(props) => props.$minified ? '#000000' : props.theme.darkGrey} !important;
  cursor: pointer;
`;

/* Looks like a nav link but can't be clicked */
const NavLinkInactive = styled.div<{ $minified?: boolean }>`
  ${baseLinkCss}
  color: ${(props) => props.theme.brandColor};
`;

const NavBar = ({ minified }: {
  minified?: boolean
}) => {
  const { user } = useContext(UserContext);

  function selectedClass(name: string) {
    if (!Router.pathname) return "";
    return String(Router.pathname).startsWith(`/${name}`);
  }

  const Logo = () => {
    return (
      <NavLogo>
        <a href="/">
          <img alt="Logo" width="40" src={nextstrainLogo.src}/>
        </a>
      </NavLogo>
    )
  }

  const LogoType = () => {
    const title = "Nextstrain";
    const rainbowTitle = title.split("").map((letter, i) =>
      <NavLogoCharacter key={i} $colorIndex={i}>{letter}</NavLogoCharacter>
    );
    const SubTitle = styled.div`
      color: black;
    `;
    const ResponsiveTitle = styled.div`
      @media (max-width: 768px) {
        display: none;
      }
    `;

    return (
      minified ?
        <div/>
        :
        <a href="/">
          <ResponsiveTitle>
            {rainbowTitle}
            {groupsApp && <SubTitle>Groups Server</SubTitle>}
          </ResponsiveTitle>
        </a>
    );
  }

  return (
    <NavContainer>
      {Router.pathname != "/" && <>
        <Logo />
        <LogoType />
      </>}
      <div style={{flex: 5}}/>
      {!groupsApp &&
        <>
          <ServerSideLink $minified={minified} href="https://docs.nextstrain.org/en/latest/index.html" >DOCS</ServerSideLink>
          <ServerSideLink $minified={minified} href="/contact">CONTACT</ServerSideLink>
          { /* Only display "blog" if we're not minified */
            minified ?
              null :
              selectedClass("blog") ?
                <NavLinkInactive $minified={minified}>BLOG</NavLinkInactive> :
                <ServerSideLink $minified={minified} href="/blog">BLOG</ServerSideLink>
          }
        </>
       }
      {user ? (
        <ServerSideLink $minified={minified} href="/whoami">
          <span role="img" aria-labelledby="userIcon">👤</span>
          {` ${user.username}`}
        </ServerSideLink>
      ) :
        <ServerSideLink $minified={minified} href="/login">LOGIN</ServerSideLink>
      }
      <div style={{width: minified ? 12 : 0 }}/>
    </NavContainer>
  );
}

// include this as part of navbar when help page is complete on static
// {this.getLink("Help", "/help", styles)}

export default NavBar;
