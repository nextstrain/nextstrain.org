import React from "react";
import styled from "styled-components"
// import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png"
const config = require("../../../data/SiteConfig");

const headerFont = "Lato, Helvetica Neue, Helvetica, sans-serif";

const styles = {
  cardMainText: {
    fontFamily: headerFont,
    fontWeight: 500,
    fontSize: 20,
    position: "absolute",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    top: "40px",
    left: "20px",
    color: "white",
    background: "rgba(0, 0, 0, 0.7)"
  },
  cardSubText: {
    color: "white",
    fontStyle: "italic",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 0.3,
    textAlign: "right"
  },
  cardOuterDiv: {
    backgroundColor: "#FFFFFF",
    // marginLeft: 10,
    // marginRight: 10,
    // marginTop: 5,
    // marginBottom: 5,
    padding: 0,
    overflow: "hidden",
    position: "relative"
    // boxSizing: "content-box"
  },
  cardInnerDiv: {
    boxShadow: "3px 3px 4px 1px rgba(215,215,215,0.85)",
    borderRadius: 2,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
    cursor: "pointer"
    // display: "flex",
    // justifyContent: "center",
    // alignItems: "center",
    // overflow: "hidden"
  },
  cardImg: {
    objectFit: "cover",
    width: "100%"
  },
  introText: {
    maxWidth: 600,
    marginTop: 0,
    marginRight: "auto",
    marginBottom: 20,
    marginLeft: "auto",
    textAlign: "center",
    fontSize: 16,
    fontWeight: 300,
    lineHeight: 1.42857143
  }
};

// const CardOuterDiv = styled.div`
//   grid-column: 1 / 3;
//   grid-row: 1 / 2;
//   z-index: 2;
//    @media screen and (max-width: 600px) {
//     order: 1;
//   }
// `

{/* <img style={styles.cardImg} src={require(`../../../static/splash_images${imgRequired}`)} alt={""} /> */}

const generateCard = (title, imgRequired, to, outboundLink) => {
  console.log(title)
  function imgAndText() {
    return (
      <div>
        <span style={styles.cardMainText}>
          {title[0]}
          {title.length === 2 ? <div style={styles.cardSubText}>{title[1]}</div> : null}
        </span>
      </div>
    );
  }
  if (outboundLink) { // use <a> and trigger google analytics
    return (
      <div style={styles.cardOuterDiv}>
        <div style={styles.cardInnerDiv}>
          <a href={to} target="_blank" onClick={() => console.log("triggerOutboundEvent")}>
            {imgAndText()}
          </a>
        </div>
      </div>
    );
  }
  return (
    <div style={styles.cardOuterDiv}>
      <div style={styles.cardInnerDiv} onClick={() => console.log("changePage")}>
        {imgAndText()}
      </div>
    </div>
  );
};


const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`

const CardInner = styled.div`
  box-shadow: 3px 3px 4px 1px rgba(215,215,215,0.85);
  border-radius: 2px;
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`
const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
`
const CardTitle = styled.div`
  font-family: ${headerFont};
  font-weight: 500;
  font-size: 28;
  position: absolute;
  padding: 10px 20px 10px 20px;
  top: 40px;
  left: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
`
{/* <img style={styles.cardImg} src={require(`../../../static/splash_images/${imgRequired}`)} alt={""} /> */}
// {generateCard([d.title, ""], d.img, d.url, false)}
export const generateTiles = () => {
  return (
    <Flex>
      {config.cards.map((d) => (
        <div key={d.title}>
          <CardOuter>
            <CardInner>
              <a href={d.to} target="_blank" onClick={() => console.log("triggerOutboundEvent")}>
                <CardTitle>
                  {d.title}
                </CardTitle>
                <img style={styles.cardImg} src={require(`../../../static/splash_images/${d.img}`)} alt={""} />
              </a>
            </CardInner>
          </CardOuter>
        </div>
      ))}
    </Flex>
  )
};
