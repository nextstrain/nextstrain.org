import styled from 'styled-components';

/**
 * Essentially the page margins, and some styles that'll be inherited like fonts.
 * Many styles chosen to match nextstrain.org, see for example
 * https://github.com/nextstrain/nextstrain.org/blob/dd5b532219188083609cc35d5e6928a43f436745/static-site/src/layouts/theme.js
 * https://github.com/nextstrain/nextstrain.org/blob/355c7d239fb848569a1d1c836e597546653542ae/static-site/src/components/layout.jsx
 */
export const Container = styled.div`
  // default margin is for mobile / small displays
  margin: 50px 0px;
  @media screen and (min-width: 1000px) {
    margin: 50px 100px;
  }
  /* border: solid purple; */
  text-align: center;
  font-family: Lato, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 300;
  line-height: 1.4;
  color: #333;
  a {
    text-decoration: none;
    background-color: transparent;
    color: #5097BA;
    font-weight: 500;
  }
  a:hover,
  a:focus {
    color: #5097BA;
    text-decoration: underline;
  }
  svg {
    // small font sizes in the panels are improved with 500 weight
    font-weight: 500;
  }
  
`