import styled from 'styled-components';

/**
 * Essentially the page margins, and some styles that'll be inherited like fonts
 */
export const Container = styled.div`
  // default margin is for mobile / small displays
  margin: 50px 0px;
  @media screen and (min-width: 1000px) {
    margin: 50px 100px;
  }
  /* border: solid purple; */
  text-align: center;
  font-family: Consolas, courier;
  font-size: 16px;
  color: #444;
`