import React from "react"
import Link from 'gatsby-link'
import styled from 'styled-components'
import config from "../../../data/SiteConfig"
import {formatFileName} from "../../util/formatFileName"

// This class should not be used for listing posts, but for chapter based Docs. See PostListing for that.

// TODO: in JSX, split out XX-name when the files have all been renamed


class Sidebar extends React.Component {
  generateItems() {
    /* generate an array where each entry corresponds to a chapter
    no posts have yeat to be added, but the ordering of chapters is correct */
    const data = this.props.otherPostsMeta
      .sort((a, b) => {
        if (parseInt(a.chapterOrder, 10) < parseInt(b.chapterOrder, 10)) return -1
        if (parseInt(a.chapterOrder, 10) > parseInt(b.chapterOrder, 10)) return 1
        return 0
      })
      .map((d) => d.chapter)
      .filter((cv,idx,arr)=>arr.indexOf(cv)===idx) /* filter to unique values */
      .map((d) => ({name: d, posts: []}))

    /* add each post to the correct chapter within data */
    this.props.otherPostsMeta.forEach((meta) => {
      const chapterIdx = data.findIndex((el) => el.name === meta.chapter);
      data[chapterIdx].posts.push({
        title: meta.title,
        path: meta.path,
        order: parseInt(meta.postOrder, 10)
      })
    })

    /* sort posts within each chapter */
    data.forEach((d) => {
      d.posts = d.posts.sort((a, b) => { // eslint-disable-line
        if (parseInt(a.order, 10) < parseInt(b.order, 10)) return -1
        if (parseInt(a.order, 10) > parseInt(b.order, 10)) return 1
        return 0
      })
    })

    return data.map((chapter) => {
      const postTitles = chapter.posts.map((post) => {
        const titleJSX =
          this.props.selectedPostMeta.title === post.title && this.props.selectedPostMeta.chapter === chapter.name ?
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
        )
      })
      return (
        <li key={chapter.name} className='chapter'>
          <h5 className='tocHeading'>
            {formatFileName(chapter.name)}
          </h5>
          <ul className='chapterItems'>
            {postTitles}
          </ul>
        </li>
      )
    })
  }

  render() {
    return (
      <SidebarContainer>
        <ul>
          {this.generateItems()}
        </ul>
      </SidebarContainer>
    )
  }
}

const SelectedPostTitle = styled.h6`
  border-left: 3px solid black;
  font-weight: 700;
  padding-left: 5px;
  font-size: 1.6rem;
  color: black;
  &:hover {
    border-bottom: 0px;
  }
`
const UnselectedPostTitle = styled.h6``

const SidebarContainer = styled.div`
  padding: ${props => props.theme.sitePadding};
  background-color: ${props => props.theme.lightGrey};
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
     color: ${props => props.theme.blue};
     margin-bottom: 10px;
  }
`

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
`

export default Sidebar
