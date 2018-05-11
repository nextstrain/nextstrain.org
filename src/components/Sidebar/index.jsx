import React from "react";
import Link from 'gatsby-link';
import styled from 'styled-components';
import {formatFileName} from "../../util/formatFileName";

const parseSlug = require("../../util/parseSlug");
const structureEdges = require("../../util/structureEdges");

class Sidebar extends React.Component {
  generateItems(selectedSlugInfo) {
    const [hasChapters, data] = structureEdges.parseEdges(this.props.allNodes, selectedSlugInfo.section);
    const renderListOfPosts = (listOfPosts, chapterNameOfPost = undefined) => listOfPosts.map((post) => {
      let highlightPost = selectedSlugInfo.title === post.title;
      if (chapterNameOfPost) {
        if (selectedSlugInfo.chapter !== chapterNameOfPost) highlightPost = false;
      }
      const titleJSX = highlightPost ?
      (<SelectedPostTitle>{formatFileName(post.title)}</SelectedPostTitle>) :
      (<UnselectedPostTitle>{formatFileName(post.title)}</UnselectedPostTitle>);
      return (
        <ItemContainer key={post.path}>
          <Link to={post.path}>
            <li>
              {titleJSX}
            </li>
          </Link>
        </ItemContainer>
      );
    });

    /* RETURN JSX */
    if (hasChapters) {
      return data.map((chapter) => (
        <li key={chapter.name} className="chapter">
          <h5 className="tocHeading">
            {formatFileName(chapter.name)}
          </h5>
          <ul className="chapterItems">
            {renderListOfPosts(chapter.posts, chapter.name)}
          </ul>
        </li>
      ));
    }
    return (
      <div style={{paddingTop: "20px"}}>
        {renderListOfPosts(data)}
      </div>
    );
  }


  render() {
    const selectedSlugInfo = parseSlug.parseSlug(this.props.selectedSlug);
    return (
      <SidebarContainer>
        <SectionTitle>{selectedSlugInfo.section.toUpperCase()}</SectionTitle>
        <ul>
          {this.generateItems(selectedSlugInfo)}
        </ul>
      </SidebarContainer>
    );
  }
}

const SectionTitle = styled.h3``;

const SelectedPostTitle = styled.h6`
  border-left: 3px solid black;
  font-weight: 500 !important;
  padding-left: 5px;
  font-size: 1.6rem;
  color: black;
  &:hover {
    border-bottom: 0px;
  }
`;
const UnselectedPostTitle = styled.h6``;

const SidebarContainer = styled.div`
  padding: ${(props) => props.theme.sitePadding};
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
     font-weight: 200;
     color: ${(props) => props.theme.blue};
     margin-bottom: 10px;
  }
`;

const ItemContainer = styled.div`
  h6, p {
    color: black;
    margin: 0;
    line-height: 1.5;
  }

  li {
    margin: 0;
  }
  &:hover {
    li {
      span {
        border-bottom: 1px solid black;
      }
    }
  }
`;

export default Sidebar;
