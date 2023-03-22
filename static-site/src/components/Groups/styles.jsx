import styled from "styled-components";
import { AvatarImg } from "../splash/sourceInfoHeading";

export const CenteredForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  margin: 10px;
`;

export const InputButton = styled.button`
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
  &:hover:enabled {
    color: black;
    border: 1px solid black;
  }
  &:disabled {
    border: none;
  }
`;

export const AvatarWithoutMargins = styled(AvatarImg)`
  margin: 0;
`;
