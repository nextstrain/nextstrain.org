import styled, { css } from "styled-components";
import { AvatarImg } from "../splash/sourceInfoHeading";

export const CenteredForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
  margin: 10px;
`;

const sharedInputStyle = css`
  border: 1px solid #CCC;
  background-color: inherit;
  border-radius: 3px;
  cursor: pointer;
  padding: 5px 10px 5px 10px;
  font-size: 12px;
  font-family: ${(props) => props.theme.generalFont};
  color: ${(props) => props.theme.darkGrey};
  font-weight: 400;
  text-transform: uppercase;
  vertical-align: middle;
  margin: 5px;
`;

const sharedInputHoverStyle = css`
  color: black;
  border: 1px solid black;
`;

export const InputLabel = styled.label`
  ${sharedInputStyle}
  &:hover {
    ${sharedInputHoverStyle}
  }
`;

export const InputButton = styled.button`
  ${sharedInputStyle}
  &:hover:enabled {
    ${sharedInputHoverStyle}
  }
  &:disabled {
    border: none;
  }
`;

export const AvatarWithoutMargins = styled(AvatarImg)`
  margin: 0;
`;

export const TextArea = styled.textarea`
width: 100%;
height: 100%;
font-size: 14px;
font-family: monospace;
color: ${(props) => props.theme.darkGrey};
`;
