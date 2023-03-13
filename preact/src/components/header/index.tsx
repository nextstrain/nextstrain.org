import {h, Component} from "preact";
import { Link } from 'preact-router/match';

// import {Link} from 'gatsby';
// import styled, {css} from 'styled-components';
// import { startsWith } from "lodash";
// import { UserContext } from "../../layouts/userDataWrapper";

// const NavLogo = styled.div`
//   padding-left: 8px;
//   padding-right: 2px;
//   padding-top: 0px;
//   padding-bottom: 0px;
//   cursor: pointer;
//   font-size: ${(props) => props.minified ? '12px' : '16px'};
// `;

// const NavLogoCharacter = styled.span`
//   padding: 0px;
//   text-decoration: none;
//   font-size: 20px;
//   font-weight: 400;
//   cursor: pointer;
//   color: ${(props) => {
//     try {
//       return props.theme.titleColors[props.colorIndex];
//     } catch (err) {
//       console.log("ERROR in props.", props);
//       return "black";
//     }
//   }};
// `;

// const baseLinkCss = css`
//   padding-left: ${(props) => props.minified ? '6px' : '12px'};
//   padding-right: ${(props) => props.minified ? '6px' : '12px'};
//   padding-top: 20px;
//   padding-bottom: 20px;
//   text-decoration: none !important;
//   font-size: ${(props) => props.minified ? '12px' : '16px'} !important;
//   font-weight: 400;
// `;

// /** Link which, if relative, will have event handlers attached by gatsby.
//  * This means it _won't_ be seen by the server!
//  */
// const NavLinkToBeHandledByGatsby = styled((props) => <Link {...props} />)`
//   ${baseLinkCss}
//   color: ${(props) => props.minified ? '#000000' : props.theme.darkGrey} !important;
//   cursor: pointer;
// `;

// /** Link which shouldn't have any event handlers attached by gatsby. This means it'll go to the server
//  * even if it's a relative link, which is essential for some functionality, but can cause
//  * a page flash
//  */
// const NavLinkToGoToServer = styled.a`
//   ${baseLinkCss}
//   color: ${(props) => props.minified ? '#000000' : props.theme.darkGrey} !important;
//   cursor: pointer;
// `;

// /* Looks like a nav link but can't be clicked */
// const NavLinkInactive = styled.div`
//   ${baseLinkCss}
//   color: ${(props) => props.theme.brandColor};
// `;


const NextstrainRainbow = () => {
  const title = "Nextstrain";
  const titleColors = ["#4377CD", "#5097BA", "#63AC9A", "#7CB879", "#9ABE5C", "#B9BC4A", "#D4B13F", "#E49938", "#E67030", "#DE3C26"];
  return (<div>
    {
      title.split("").map((letter, i) =>
        // eslint-disable-next-line react/no-array-index-key
        (<span className="letter" key={i} style={{color: titleColors[i]}}>{letter}</span>)
      )
    }
  </div>);
};

/* NOTE: there was a minified prop which I didn't port over */
class NavBar extends Component {
  // static contextType = UserContext;

  // selectedClass(name) {
  //   if (!this.props.location || !this.props.location.pathname) return "";
  //   return startsWith(this.props.location.pathname, `/${name}`); // can't run this.props.location.pathname.startsWith(`/${name}`) on IE
  // }

  // getLogoType() {
  //   const title = "Nextstrain";
  //   const rainbowTitle = title.split("").map((letter, i) =>
  //     // eslint-disable-next-line react/no-array-index-key
  //     <NavLogoCharacter key={i} colorIndex={i}>{letter}</NavLogoCharacter>
  //   );
  //   return (
  //     this.props.minified ?
  //       <div/>
  //       :
  //       <Link to="/">
  //         {rainbowTitle}
  //       </Link>
  //   );
  // }

  render() {
    return (
      <div className="header">
        <div className="nextstrainLogo">
          <Link activeClassName="active" href="/">
            <img alt="Logo" width="40" src="../../assets/logos/nextstrain-logo-small.png"/>
          </Link>
        </div>

        <Link activeClassName="active" href="/">
          <NextstrainRainbow/>
        </Link>

        <div style={{flex: 5}}/>

        <a href="https://docs.nextstrain.org/en/latest/learn/about-nextstrain.html">HELP</a>
        <a href="https://docs.nextstrain.org/en/latest/index.html">DOCS</a>
        <Link activeClassName="active" href="/blog">BLOG</Link>

        {/* {this.context.user ? (
          <NavLinkToGoToServer minified={minified} href="/whoami">
            <span role="img" aria-labelledby="userIcon">👤</span>
            {` ${this.context.user.username}`}
          </NavLinkToGoToServer>
        ) :
          <NavLinkToGoToServer minified={minified} href="/login">LOGIN</NavLinkToGoToServer>
        } */}
        <div style={{width: 0 }}/>
      </div>
    );
  }
}

export default NavBar;
