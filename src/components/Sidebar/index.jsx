import React from "react"
import Link from 'gatsby-link'
import styled from 'styled-components'
import config from "../../../data/SiteConfig"
import {formatFileName} from "../../utils/formatFileName"

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
        const selStyle = this.props.selectedPostMeta.title === post.title && this.props.selectedPostMeta.chapter === chapter.name ?
          {borderLeft: "7px solid black", fontWeight: 500, paddingLeft: "7px"} :
          {}
        return (
          <ItemContainer key={post.path}>
            <Link to={post.path}>
              <li>
                <h6 style={selStyle}>{formatFileName(post.title)}</h6>
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

const SidebarContainer = styled.div`
  padding: ${props => props.theme.sitePadding};

  & > ul, .chapterItems {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  p, h6 {
    display: inline-block;
    font-weight: 200;
    margin: 0;
  }
  .sel {
    border-left: 2px solid black;
    color: red;
  }
  .tocHeading {
     font-weight: 200;
     color: ${props => props.theme.brand};
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
