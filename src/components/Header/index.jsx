import React from "react"
import Link from 'gatsby-link'
import styled from 'styled-components'
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png"
import ExternalLinkSvg from "../Misc/external-link";

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background: #F6F6F6;
  padding: 5px;
  align-items: center;
  position: relative;
  .nav-link {
    font-size: 16px;
    margin-right: 10px;
    color: black;
    font-weight: 400;
    text-decoration: "none";
  }

  .selected-nav {
    border-bottom: 2px solid black;
    font-weight: 700;
  }

  somespace {
    width: 15px;
  }

  section {
    display: flex;
    align-items: center;
  }

  github {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    align-items: center;
    font-size: 1.8em;
  }

  githubtext {
    margin-right: 2px
  }

  @media screen and (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;

    section {
      margin-bottom: 10px;
    }

    span {
      display: none;
    }

  }
`

const Dot = (
  <span style={{marginLeft: 10, marginRight: 10, color: "black"}}>
    •
  </span>
)

class Header extends React.Component {

  getStyles() {
    return {
      main: {
        maxWidth: 960,
        marginTop: "auto",
        marginRight: "auto",
        marginBottom: "auto",
        marginLeft: "auto",
        height: 50,
        justifyContent: "space-between",
        alignItems: "center",
        overflow: "hidden",
        left: 0,
        zIndex: 1001,
        transition: "left .3s ease-out"
      },
      logo: {
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingTop: "20px",
        paddingBottom: "20px",
        color: "#000",
        cursor: "pointer",
        textDecoration: "none",
        fontSize: this.props.minified ? 12 : 16
      },
      title: {
        padding: "0px",
        color: "#000",
        textDecoration: "none",
        fontSize: 20,
        fontWeight: 400
      },
      link: {
        paddingLeft: this.props.minified ? "6px" : "12px",
        paddingRight: this.props.minified ? "6px" : "12px",
        paddingTop: "20px",
        paddingBottom: "20px",
        textDecoration: "none",
        cursor: "pointer",
        fontSize: this.props.minified ? 12 : 16,
        ':hover': {
          color: "#5097BA"
        }
      },
      inactive: {
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingTop: "20px",
        paddingBottom: "20px",
        color: "#5097BA",
        textDecoration: "none",
        fontSize: this.props.minified ? 12 : 16
      },
      alerts: {
        textAlign: "center",
        verticalAlign: "middle",
        width: 70,
        color: "#5097BA"
      }
    };
  };

  selClass(name) {
    if (!this.props.location || !this.props.location.pathname) return "";
    return this.props.location.pathname.startsWith(`/${name}`) ?
      "selected-nav" :
      ""
  }

  getLogo(styles) {
    return (
      <Link to='/' style={styles.logo}>
        <img alt="Logo" width="40" src={nextstrainLogo}/>
      </Link>
    );
  }

  render() {
    const styles = this.getStyles();
    return (
      <NavContainer>
        <section>
          {this.getLogo(styles)}
          <somespace />
          <somespace />
          <Link className={`nav-link ${this.selClass("about")}`} to='/about' > About </Link>
          <somespace />
          <Link className={`nav-link ${this.selClass("docs")}`} to='/docs/builds/zika-build' > Docs </Link>
          <somespace />
          <Link className={`nav-link ${this.selClass("methods")}`} to='/methods/overview/introduction' > Methods </Link>
          <somespace />
          <Link className={`nav-link ${this.selClass("reports")}`} to='/reports/flu-vaccine-selection/2017-february' > Reports </Link>
        </section>
      </NavContainer>
    )
  }
}
/* REMOVED HEADERS (these are still available if you know the URL)
{Dot}
<Link className={`nav-link ${this.selClass("blog")}`} to='/blog/2018/placeholder' > blog </Link>
{Dot}
<Link className={`nav-link ${this.selClass("dev")}`} to='/developer/auspice/page-load' > developer </Link>
*/
export default Header
