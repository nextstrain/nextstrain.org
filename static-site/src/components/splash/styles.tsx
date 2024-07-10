import styled from "styled-components";
import React from "react";

export const Container = styled.div`
  padding-left: 25px;
  padding-right: 25px;
  display: block;
  margin-right: auto;
  margin-left: auto;

  @media (min-width: 768px) {
    width: 728px;
  }
  @media (min-width: 992px) {
    width: 952px;
  }
  @media (min-width: 1200px) {
    width: 1150px;
  }
  @media (min-width: 1550px) {
    width: 1500px;
  }
`;

export const StyledDiv = styled.div`
  text-align: justify;
  font-size: ${(props) => props.theme.niceFontSize};
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: 300;
  color: ${(props) => props.theme.darkGrey};
  line-height: ${(props) => props.theme.tightLineHeight};
`;

export const H1 = styled.div`
  text-align: center;
  font-size: 38px;
  line-height: 32px;
  font-weight: 300;
  color: ${(props) => props.theme.darkGrey};
  min-width: 240px;
  margin-top: 0px;
  margin-bottom: 0px;
`;

export const H1Small = styled(H1)`
  font-size: 32px;
`;

export const H2 = styled.div<{ $left?: boolean }>`
  text-align: ${(props) => props.$left ? "left" : "center"};
  font-size: 24px;
  line-height: 32px;
  font-weight: 500;
  color: ${(props) => props.theme.darkGrey};
  min-width: 240px;
  margin-top: 0px;
  margin-bottom: 0px;
`;

export const H3 = styled.div<{ $left?: boolean }>`
  text-align: ${(props) => props.$left ? "left" : "center"};
  font-size: 20px;
  line-height: 32px;
  font-weight: 500;
  color: ${(props) => props.theme.darkGrey};
  min-width: 240px;
  margin-top: 0px;
  margin-bottom: 0px;
`;

export const H4 = styled.div<{ $left?: boolean }>`
  text-align: ${(props) => props.$left ? "left" : "center"};
  font-size: 18px;
  line-height: 32px;
  font-weight: 500;
  color: ${(props) => props.theme.darkGrey};
  min-width: 240px;
  margin-top: 0px;
  margin-bottom: 0px;
`;

export const Heading = styled.div<{ fontSize: number, attn?: boolean }>`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: ${(props) => props.attn ? "600": "500"};
  font-size: ${(props) => `${props.fontSize}px`};
  @media (max-width: 768px) {
    font-size: 18px;
  }
  border-radius: 3px;
  padding: 10px 20px 10px 20px;
  top: 40px;
  left: 20px;
`;

export const SitRepTitle = styled.div<{ $attn?: boolean }>`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: ${(props) => props.$attn ? "600": "500"};
  font-size: 16px;
  @media (max-width: 768px) {
    font-size: 18px;
  }
  border-radius: 3px;
  padding: 5px 20px 10px 20px;
  top: 40px;
  left: 20px;
`;

export const CenteredFocusParagraph = styled.p`
  max-width: 640px;
  margin-top: 0px;
  margin-right: auto;
  margin-bottom: 0px;
  margin-left: auto;
  text-align: center;
  font-size: ${(props) => props.theme.niceFontSize};
  font-weight: 300;
  line-height: ${(props) => props.theme.tightLineHeight};
  strong {
    font-weight: 500;
  }
`;

export const FocusParagraph = styled.p`
  margin-top: 0px;
  margin-right: auto;
  margin-bottom: 0px;
  margin-left: auto;
  text-align: left;
  font-size: ${(props) => props.theme.niceFontSize};
  font-weight: 300;
  line-height: ${(props) => props.theme.tightLineHeight};
`;

export const NarrowFocusParagraph = styled(FocusParagraph)`
  max-width: 640px;
`;

export const IconParagraph = styled.div`
  margin-top: 0px;
  margin-right: auto;
  margin-bottom: 0px;
  margin-left: auto;
  text-align: center;
  font-size: ${(props) => props.theme.niceFontSize};
  font-weight: 300;
  line-height: 2.5;
`;

export const WideParagraph = styled.p`
  margin-top: 0px;
  margin-bottom: 0px;
  font-size: 14px !important;
  font-weight: 300;
  line-height: ${(props) => props.theme.tightLineHeight};
`;

export const CenteredWideParagraph = styled.p`
  margin-left: auto;
  margin-right: auto;
  margin-top: 0px;
  margin-bottom: 0px;
  text-align: center;
  font-size: 14px !important;
  font-weight: 300;
  line-height: ${(props) => props.theme.tightLineHeight};
`;

export const FooterParagraph = styled.p`
  margin-left: auto;
  margin-right: auto;
  margin-top: 0px;
  margin-bottom: 0px;
  font-size: ${(props) => props.theme.smallFontSize} !important;
  font-weight: 300;
  text-align: center;
  color: ${(props) => props.theme.medGrey} !important;
  line-height: ${(props) => props.theme.tightLineHeight};
`;

const ButtonContainer = styled.button`
  border: 1px solid #CCC;
  background-color: inherit;
  border-radius: 3px;
  cursor: pointer;
  padding: 5px 10px 5px 10px;
  font-size: 16px;
  font-family: ${(props) => props.theme.generalFont};
  color: ${(props) => props.theme.medGrey};
  font-weight: 400;
  text-transform: uppercase;
  font-size: 14;
  vertical-align: middle;
  &:hover {
    color: black;
    border: 1px solid black;
  }
`;

export const Button = ({to, children, target, rel}: {
  to: string
  children: React.ReactNode
  target?: string
  rel?: string
}) => (
  <a href={to} target={target} rel={rel}>
    <ButtonContainer>
      {children}
    </ButtonContainer>
  </a>
);
