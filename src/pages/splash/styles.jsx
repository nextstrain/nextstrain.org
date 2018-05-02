import styled from "styled-components"
import Link from 'gatsby-link'
import React from "react";

/* these should be centralised */
const darkGrey = "#333";
const medGrey = "#888";
const dataFont = "Lato, Helvetica Neue, Helvetica, sans-serif";

export const Container = styled.div`
  padding-left: 25px;
  padding-right: 25px;
  display: block;
`
/* for some reason, this doesn't work (it should)
@media (max-width: 1200px) {
  width: 1150px;
}
*/

export const Flex = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
`

export const Bigspacer = styled.div`
  height: 30px;
`

export const StyledDiv = styled.div`
  text-align: justify;
  font-size: 16px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: 300;
  color: var(--darkGrey);
  line-height: 1.42857143;
`

export const H1 = styled.div`
  text-align: center;
  font-size: 38px;
  line-height: 32px;
  font-weight: 300;
  color: ${darkGrey};
  min-width: 240px;
  margin-top: 40px;
  margin-bottom: 30px;
`

export const CenteredFocusParagraph = styled.p`
  max-width: 600px;
  margin-top: 0;
  margin-right: auto;
  margin-bottom: 20px;
  margin-left: auto;
  text-align: center;
  font-size: 16;
  font-weight: 300;
  line-height: 1.42857143;
`


const ButtonContainer = styled.button`
  border: 1px solid #CCC;
  background-color: inherit;
  border-radius: 2px;
  cursor: pointer;
  padding: 5px 10px 5px 10px;
  font-family: ${dataFont};
  color: ${medGrey};
  font-weight: 400;
  text-transform: uppercase;
  font-size: 14;
  vertical-align: top;
  &:hover {
    color: black;
    border: 1px solid black;
  }
`

export const CardImg = styled.img`
  object-fit: cover;
  width: 100%;
`
export const CardInner = styled.div`
  box-shadow: 3px 3px 4px 1px rgba(215,215,215,0.85);
  border-radius: 2px;
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`
export const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  padding: 15px 0px 15px 0px;
`
export const CardTitle = styled.div`
  font-family: ${dataFont};
  font-weight: 500;
  font-size: 28;
  position: absolute;
  padding: 10px 20px 10px 20px;
  top: 40px;
  left: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
`

export class Button extends React.Component {
  render() {
    return(
      <Link style={{border: 'none'}} to={this.props.to}>
        <ButtonContainer>
          {this.props.children}
        </ButtonContainer>
      </Link>
    )
  }
}
