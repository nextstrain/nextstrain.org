import React from "react";
import Link from 'gatsby-link';
import Flex from "../framework/flex";
import { titleColors, darkGrey, brandColor } from "../../util/globals";
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";

class Header extends React.Component {

  getStyles() {
    return {
      main: {
        marginTop: "auto",
        marginRight: "auto",
        marginBottom: "auto",
        marginLeft: "auto",
        height: 50,
        justifyContent: "flex-start",
        background: "inherit",
        alignItems: "center",
        overflow: "hidden",
        left: 0,
        zIndex: 1001,
        transition: "left .3s ease-out",
        boxShadow: '0px -3px 1px -3px rgba(0, 0, 0, 0.5) inset'
      },
      logo: {
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingTop: "20px",
        paddingBottom: "20px",
        color: "#000",
        cursor: "pointer"
      },
      title: {
        color: "#000",
        textDecoration: "none",
        fontSize: 18,
        fontWeight: 400,
        paddingTop: "20px",
        paddingBottom: "20px"
      },
      link: {
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "20px",
        paddingBottom: "20px",
        textDecoration: "none",
        cursor: "pointer",
        fontWeight: 300,
        fontSize: 18,
        ':hover': {
          color: "#5097BA"
        }
      },
      inactive: {
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "20px",
        paddingBottom: "20px",
        color: brandColor,
        textDecoration: "none",
        fontWeight: 300,
        fontSize: 18
      },
      alerts: {
        textAlign: "center",
        verticalAlign: "middle",
        width: 70,
        color: brandColor
      }
    };
  }

  selectedClass(name) {
    if (!this.props.location || !this.props.location.pathname) return "";
    return this.props.location.pathname.startsWith(`/${name}`);
  }

  getLogo(styles) {
    return (
      <Link to="/" style={styles.logo}>
        <img alt="Logo" width="40" src={nextstrainLogo}/>
      </Link>
    );
  }

  getLogoType(styles) {
    const title = "Nextstrain";
    const rainbowTitle = title.split("").map((letter, i) =>
      <span key={i} style={{ ...styles.title, ...{color: titleColors[i]} }}>{letter}</span>
    );
    return (
      <span>
        {rainbowTitle}
      </span>
    );
  }

  getLink(name, url, selected, styles) {
    const linkCol = this.props.minified ? "#000" : darkGrey;
    return (
      selected ?
        <div style={{ ...{color: linkCol}, ...styles.inactive }}>{name}</div> :
        <Link to={url} style={{ ...{color: linkCol}, ...styles.link }}>
          {name}
        </Link>
    );
  }

  render() {
    const styles = this.getStyles();
    return (
      <Flex style={styles.main}>
        {this.getLogo(styles)}
        {this.getLogoType(styles)}
        <div style={{flex: 1}}/>
        {this.getLink("About", "/about", this.selectedClass("about"), styles)}
        {this.getLink("Docs", "/docs/builds/zika-build", this.selectedClass("docs"), styles)}
        {this.getLink("Methods", "/methods/overview/introduction", this.selectedClass("methods"), styles)}
        {this.getLink("Reports", "/reports/flu-vaccine-selection/2017-february", this.selectedClass("reports"), styles)}
      </Flex>
    );
  }
}

/* REMOVED HEADERS (these are still available if you know the URL)
{Dot}
<Link className={`nav-link ${this.selClass("blog")}`} to='/blog/2018/placeholder' > blog </Link>
{Dot}
<Link className={`nav-link ${this.selClass("dev")}`} to='/developer/auspice/page-load' > developer </Link>
*/
export default Header;
