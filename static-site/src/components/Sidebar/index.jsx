import React from "react";
import Link from 'next/link'
import styled from 'styled-components';

const Sidebar = ({title, posts}) => {
  return (
    <SidebarContainer>
      <SectionTitle>{title.toUpperCase()}</SectionTitle>
      <ul>
        {posts.map((post) => (
          <IndividualPost {...post} key={post.sidebarName}/>
        ))}
      </ul>
      <div style={{paddingBottom: "30px"}}/>
    </SidebarContainer>
  );
}

const IndividualPost = ({blogUrlName, sidebarName, selected}) => {
  return (
    <ItemContainer key={sidebarName}>
      <Link href={`/blog/${blogUrlName}`}>
        <li>
          {selected ?
            (<SelectedPostTitle>{sidebarName}</SelectedPostTitle>) :
            (<UnselectedPostTitle>{sidebarName}</UnselectedPostTitle>)
          }
        </li>
      </Link>
    </ItemContainer>
  );
}

/* -------------- styled components below ------------------- */

const SectionTitle = styled.h3``;

const SelectedPostTitle = styled.h6`
  border-left: 3px solid ${(props) => props.theme.brandColor};
  font-weight: 500 !important;
  padding-left: 5px;
  font-size: 1.6rem;
  color: ${(props) => props.theme.brandColor} !important;
  &:hover {
    border-bottom: 0px;
  }
`;
const UnselectedPostTitle = styled.h6``;

const SidebarContainer = styled.div`
  padding-left: 25px;
  padding-top: 5px;
  height: 100%;
  & > ul, .chapterItems {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  p, h6 {
    display: inline-block;
    font-weight: 200;
    margin: 0 !important;
  }
  .sel {
    border-left: 2px solid black;
    color: red;
  }
  .tocHeading {
     font-weight: 500;
     color: ${(props) => props.theme.darkGrey};
     margin-bottom: 10px;
  }
`;

const ItemContainer = styled.div`
  margin-bottom: 5px;

  h6, p {
    color: black;
    margin: 0;
    line-height: 1.5;
  }

  :hover {
    h6, p {
        color: ${(props) => props.theme.brandColor};
    }
  }

  li {
    margin: 0;
  }
  &:hover {
    li {
      span {
        border-bottom: 1px solid black;
        color: ${(props) => props.theme.brandColor};
      }
    }
  }
`;

export default Sidebar;
