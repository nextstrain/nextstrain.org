import React from "react";
import Link from 'gatsby-link';
import styled from 'styled-components';
import {formatFileName} from "../../util/formatFileName";
import {parseSlug} from "../../util/parseSlug";


class Sidebar extends React.Component {


  // const selectedPostMeta = parseSlug(slug);
  // const otherPostsMeta = this.props.data.allSlugs.edges
  //   .map((e) => ({
  //     ...parseSlug(e.node.fields.slug),
  //     chapterOrder: e.node.fields.chapterOrder,
  //     postOrder: e.node.fields.postOrder
  //   }))
  //   .filter((d) => d.category === selectedPostMeta.category);


  generateItems() {
    const selectedSlugInfo = parseSlug(this.props.selectedSlug);
    const sectionNodesInfo = this.props.sectionNodes.map((e) => ({
      ...parseSlug(e.node.fields.slug),
      chapterOrder: e.node.fields.chapterOrder,
      postOrder: e.node.fields.postOrder
    }));
    console.log("nodes (sectionNodesInfo)", sectionNodesInfo)

    const hasChapters = !!selectedSlugInfo.chapter;

    let data = []; /* no chapters by default */
    if (hasChapters) {
      /* generate an array where each entry corresponds to a chapter
      no posts have yeat to be added, but the ordering of chapters is correct */
      data = sectionNodesInfo
        .sort((a, b) => {
          if (parseInt(a.chapterOrder, 10) < parseInt(b.chapterOrder, 10)) return -1;
          if (parseInt(a.chapterOrder, 10) > parseInt(b.chapterOrder, 10)) return 1;
          return 0;
        })
        .map((d) => d.chapter)
        .filter((cv, idx, arr) => arr.indexOf(cv)===idx) /* filter to unique values */
        .map((d) => ({name: d, posts: []}));
    }


    /* add each post to the correct chapter within data */
    sectionNodesInfo.forEach((meta) => {
      const nodeData = {
        title: meta.title,
        path: meta.path,
        order: parseInt(meta.postOrder, 10)
      };
      if (hasChapters) {
        const chapterIdx = data.findIndex((el) => el.name === meta.chapter);
        data[chapterIdx].posts.push(nodeData);
      } else {
        data.push(nodeData);
      }
    });

    /* sort posts within each chapter */
    const postSorter = (a, b) => {
      if (parseInt(a.order, 10) < parseInt(b.order, 10)) return -1;
      if (parseInt(a.order, 10) > parseInt(b.order, 10)) return 1;
      return 0;
    };
    if (hasChapters) {
      data.forEach((d) => {d.posts = d.posts.sort(postSorter);});
    } else {
      data.sort(postSorter);
    }

    console.log("DATA", data);

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
    return renderListOfPosts(data);
  }


  render() {
    return (
      <SidebarContainer>
        <ul>
          {this.generateItems()}
        </ul>
      </SidebarContainer>
    );
  }
}

const SelectedPostTitle = styled.h6`
  border-left: 3px solid black;
  text-shadow: 1px 0px 0px black;
  font-weight: 700;
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
