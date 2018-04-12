import React from "react"
import Link from 'gatsby-link'
import styled from 'styled-components'
import config from "../../../data/SiteConfig"
const _ = require("lodash");

// This class should not be used for listing posts, but for chapter based Docs. See PostListing for that.

// TODO: in JSX, split out XX-name when the files have all been renamed

class Sidebar extends React.Component {
  generateItems() {
    const data = this.props.allSlugs
      .map((d) => d.chapter)
      .filter((v,i,a)=>a.indexOf(v)===i)
      .sort() // TO DO
      .map((chapter) => ({name: chapter, posts: []}))
    
    this.props.allSlugs.forEach((slug) => {
      const idx = data.findIndex((el) => el.name === slug.chapter);
      data[idx].posts.push({title: slug.title, path: slug.path})
    })

    data.forEach((d) => {d.posts = d.posts.sort((dd) => dd.title)})

    return data.map((chapter) => {
      const postTitles = chapter.posts.map((post) => {
        const selStyle = this.props.selectedSlug.title === post.title && this.props.selectedSlug.chapter === chapter.name ?
          {borderLeft: "7px solid black", fontWeight: 500, paddingLeft: "7px"} :
          {}
        return (
          <ItemContainer key={post.path}>
            <Link to={post.path}>
              <li>
                <h6 style={selStyle}>{_.startCase(post.title)}</h6>
              </li>
            </Link>
          </ItemContainer>
        )
      })
      return (
        <li key={chapter.name} className='chapter'>
          <h5 className='tocHeading'>
            {chapter.name}
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
