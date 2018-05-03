import React from "react";

const browserDimensions = 1000; /* TODO */
const titleColors = ["#4377CD", "#5097BA", "#63AC9A", "#7CB879", "#9ABE5C", "#B9BC4A", "#D4B13F", "#E49938", "#E67030", "#DE3C26"];
const titleFont = "Lato, Helvetica Neue, Helvetica, sans-serif";
const medGrey = "#888";

class Title extends React.Component {
  getStyles() {
    let fontSize = 106;
    if (browserDimensions.width < 500) {
      fontSize = 84;
    }
    if (browserDimensions.width < 450) {
      fontSize = 78;
    }
    if (browserDimensions.width < 400) {
      fontSize = 72;
    }
    if (browserDimensions.width < 350) {
      fontSize = 66;
    }
    return {
      title: {
        fontFamily: titleFont,
        fontSize: fontSize,
        marginTop: 0,
        marginBottom: 0,
        fontWeight: 300,
        color: medGrey,
        letterSpacing: "-1px"
      }
    };
  }
  createTitle() {
    const title = "nextstrain";
    return title.split("").map((letter, i) =>
      <span key={i} style={{color: titleColors[i] }}>{letter}</span>
    );
  }
  render() {
    const styles = this.getStyles();
    return (
      <span style={{ ...styles.title, ...this.props.style }}>
        {this.createTitle()}
      </span>
    );
  }
}

export default Title;
