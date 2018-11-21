/* eslint-disable no-multi-spaces */
import React from "@libraries/react"; // eslint-disable-line

const logoPNG = require("./nextstrain-logo-small.png");

/* This code is straight from the auspice repo.
 * There are theme props available if one used styled components here
 */

const titleColors = ["#4377CD", "#5097BA", "#63AC9A", "#7CB879", "#9ABE5C", "#B9BC4A", "#D4B13F", "#E49938", "#E67030", "#DE3C26"];
const darkGrey = "#333";

const getStyles = ({minified=true, width}={}) => ({
  flexColumns: {
    display: "flex",
    flexDirection: "row",
    whiteSpace: "nowrap",
    justifyContent: "center",
    alignItems: "center"
  },
  flexRows: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    padding: "0px",
    color: "#000",
    textDecoration: "none",
    fontSize: 20,
    fontWeight: 400,
    cursor: "pointer"
  },
  link: {
    padding: minified ? "6px 12px" : "20px 20px",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    fontSize: minified ? 12 : 16,
    fontWeight: 400,
    textTransform: "uppercase",
    color: minified ? "#000" : darkGrey
  },
  logo: {
    padding: "5px 5px",
    width: "50px",
    cursor: "pointer"
  },
  narrativeTitle: {
    whiteSpace: "nowrap",
    fontSize: 16,
    marginLeft: "auto",
    padding: "0px 12px",
    float: "right",
    maxWidth: `${width-90}px`,
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
});

const renderLink = (text, url, style) => (
  <a key={text} style={style} href={url}>
    {text}
  </a>
);

const renderNextstrainTitle = (style) => (
  <a id="RainbowNextstrain" style={style} href="/">
    {"Nextstrain".split("").map((letter, i) =>
      <span key={i} style={{color: titleColors[i]}}>{letter}</span>
    )}
  </a>
);

const renderNarrativeTitle = (text, style) => (
  <div style={style}>
    {`Narrative: ${text}`}
  </div>
);

const NavBar = ({sidebar, mobileDisplay, toggleHandler, narrativeTitle, width}) => {
  const styles = getStyles({minified: sidebar, narrative: !!narrativeTitle, width});
  return (
    <div style={styles.flexColumns}>
      <a id="Logo" style={styles.logo} href="/">
        <img alt="splashPage" width="40px" src={logoPNG}/>
      </a>
      {sidebar ? null : renderNextstrainTitle(styles.title)}
      <div style={{flex: 5}}/>
      <div style={styles.flexRows}>
        <div style={{...styles.flexColumns, paddingRight: "12px"}}>
          <div style={{flex: 5}}/>
          {renderLink("About", "/about",   styles.link)}
          {renderLink("Docs",  "/docs",    styles.link)}
          {renderLink("Blog",  "/blog",    styles.link)}
        </div>
        {narrativeTitle ? renderNarrativeTitle(narrativeTitle, styles.narrativeTitle) : null}
      </div>
    </div>
  );
};

export default NavBar;
