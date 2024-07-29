import React from 'react';
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";
import Title from './title';
import styled from 'styled-components';

export const Heading = () => {
  return (
    <IntroContainer>
      <Logo alt="Logo" src={nextstrainLogo.src} />
      <TitleContainer>
        <Title />
      </TitleContainer>
      <Subtitle>
        Real-time tracking of pathogen evolution
      </Subtitle>
    </IntroContainer>
  );
};

const IntroContainer = styled.div`
  // narrow widths
  display: grid;
  justify-items: center;
  grid-template-areas:
    'title'
    'subtitle';

  @media (min-width: 576px) {
    justify-items: left;
    grid-template-areas:
      'logo title'
      'logo subtitle';
  }
`

const Logo = styled.img`
  grid-area: logo;
  justify-self: end;
  align-self: center;
  height: 143px;       // height of image
  width: auto;
  padding-top: 24px;
  padding-right: 9px;

  display: none;

  @media (min-width: 576px) {
    display: inline;
  }
`

const TitleContainer = styled.div`
  grid-area: title;
`

// This should stay on a single line even at ~375px viewport width
const Subtitle = styled.div`
  grid-area: subtitle;
  font-size: 18px;

  @media (min-width: 576px) {
    padding-left: 7px;
    font-size: 27px;
  }
`
