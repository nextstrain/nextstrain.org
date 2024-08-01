import React from "react";
import styled from "styled-components";

const titleColors = ["#4377CD", "#5097BA", "#63AC9A", "#7CB879", "#9ABE5C", "#B9BC4A", "#D4B13F", "#E49938", "#E67030", "#DE3C26"];

const Title = () => (
  <TitleContainer>
    {"Nextstrain".split("").map((letter, i) => (<LetterSpan key={i} pos={i}>{letter}</LetterSpan>))}
  </TitleContainer>
);

const TitleContainer = styled.div`
  margin-top: 0px;
  margin-bottom: 0px;
  font-weight: 300;
  letter-spacing: -1px;
  font-size: 64px;
  @media (min-width: 576px) {
    font-size: 82px;
  }
  @media (min-width: 768px) {
    font-size: 106px;
  }
`;
const LetterSpan = styled.span<{ pos: number }>`
  color: ${(props) => titleColors[props.pos]};
`;

export default Title;
