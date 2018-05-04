import React from "react";
import Link from 'gatsby-link';
import Flex from "../framework/flex";
import { titleColors, darkGrey, brandColor } from "../../util/globals";
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";

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
        background: "#F6F6F6",
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
        fontWeight: 500
      },
      link: {
        paddingLeft: this.props.minified ? "6px" : "12px",
        paddingRight: this.props.minified ? "6px" : "12px",
        paddingTop: "20px",
        paddingBottom: "20px",
        textDecoration: "none",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: this.props.minified ? 12 : 16,
        ':hover': {
          color: "#5097BA"
        }
      },
      inactive: {
        paddingLeft: this.props.minified ? "6px" : "12px",
        paddingRight: this.props.minified ? "6px" : "12px",
        paddingTop: "20px",
        paddingBottom: "20px",
        color: brandColor,
        textDecoration: "none",
        fontWeight: 500,
        fontSize: this.props.minified ? 12 : 16
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
    const title = "nextstrain";
    const rainbowTitle = title.split("").map((letter, i) =>
      <span key={i} style={{ ...styles.title, ...{color: titleColors[i]} }}>{letter}</span>
    );
    return (
      this.props.minified ?
        <div/>
        :
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
        <div style={{flex: 5}}/>
        {this.getLink("About", "/about", this.selectedClass("about"), styles)}
        {this.getLink("Docs", "/docs/builds/zika-build", this.selectedClass("docs"), styles)}
        {this.getLink("Methods", "/methods/overview/introduction", this.selectedClass("methods"), styles)}
        {this.getLink("Reports", "/reports/flu-vaccine-selection/2017-february", this.selectedClass("reports"), styles)}
        <div style={{width: this.props.minified ? 20 : 0 }}/>
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
