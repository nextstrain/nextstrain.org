
import React from "react";
import {Link} from 'gatsby';
import styled from "styled-components";

import { goToAnchor } from 'react-scrollable-anchor';
import { FlexCenter } from "../../layouts/generalComponents";

function PathogenPageIntroduction({data}) {
  return (
    <FlexCenter>
      <ListContainer>
        <ul>
          {data.map((s) => (
            <li key={s.to}>
              {s.type === "external" ?
                <a href={s.to}>{s.title}</a> :
                s.type === "gatsby" ?
                  <Link to={s.to}>{s.title}</Link> :
                  s.type === "anchor" ?
                    <Clickable onClick={() => goToAnchor(s.to)}>{s.title}</Clickable> :
                    null
              }
              {s.subtext && (
                <Subtext>{s.subtext}</Subtext>
              )}
            </li>
          ))}
        </ul>
      </ListContainer>
    </FlexCenter>
  );
}

const ListContainer = styled.div`
  max-width: 640px;
  margin: 0px auto;
  font-size: 18px;
  font-weight: 300;
  line-height: ${(props) => props.theme.niceLineHeight};
  /* svg sub-elements represent icons (eg. external link) */
  svg {
    margin-left: 10px;
    font-size: 14px;
    color: ${(props) => props.theme.brandColor};
  }
  li {
    padding-bottom: 10px;
  }
`;

const Clickable = styled.span`
  cursor: pointer;
  text-decoration: none;
  color: #5097BA;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const Subtext = styled.div`
  font-style: italic;
  font-size: ${(props) => props.theme.niceFontSize};
  font-weight: 300;
  line-height: ${(props) => props.theme.niceLineHeight};
`;

export default PathogenPageIntroduction;
