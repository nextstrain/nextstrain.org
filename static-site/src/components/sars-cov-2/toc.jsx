
import React from "react";
import {Link} from 'gatsby';
import styled from "styled-components";
import { goToAnchor } from 'react-scrollable-anchor';
import { FlexCenter } from "../../layouts/generalComponents";
import * as splashStyles from "../splash/styles";

function SarsCov2Introduction({data}) {
  return (
    <FlexCenter>
      <splashStyles.FocusParagraph theme={{niceFontSize: "20px"}}>
        <ul>
          {data.map((s) => {
            switch (s.type) {
              case "external":
                return <li><a href={s.to}>{s.msg}</a></li>;
              case "gatsby":
                return <li><Link to={s.to}>{s.msg}</Link></li>;
              case "anchor":
                return <li><Clickable onClick={() => goToAnchor(s.to)}>{s.msg}</Clickable></li>;
              default:
                return null;
            }
          })}
        </ul>
      </splashStyles.FocusParagraph>
    </FlexCenter>
  );
}

const Clickable = styled.span`
  cursor: pointer;
  text-decoration: none;
  color: #5097BA;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

export default SarsCov2Introduction;
