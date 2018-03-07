import React from "react"
import Link from 'gatsby-link'
import styled from 'styled-components'
import UserLinks from '../UserLinks'

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background: ${props => props.theme.brand};
  padding: ${props => props.theme.sitePadding};

  .nav-link {
    font-size: 1.6rem;
    margin-right: 10px;
    font-weight: 200;
    color: black;
  }

  @media screen and (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;

    section {
      margin-bottom: 20px;
    }

    span {
      display: none;
    }

  }
`

class Navigation extends React.Component {

  render() {
    return (
      <NavContainer>
        <section>
          <Link className='nav-link' to='/' > N E X T S T R A I N </Link>
          <span style={{marginLeft: 10, marginRight: 10}}>•</span>
          <Link className='nav-link' to='/docs/sacra/sacra-introduction' > DOCS </Link>
          <span style={{marginLeft: 10, marginRight: 10}}>•</span>
          <Link className='nav-link' to='/docs/sacra/sacra-introduction' > TUTORIAL </Link>
          <span style={{marginLeft: 10, marginRight: 10}}>•</span>
          <Link className='nav-link' to='/docs/sacra/sacra-introduction' > POSTS </Link>
        </section>
        <span><UserLinks /></span>
      </NavContainer>
    )
  }
}

export default Navigation
