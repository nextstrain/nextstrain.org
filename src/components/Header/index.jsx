import React from "react"
import Link from 'gatsby-link'
import styled from 'styled-components'
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png"
import ExternalLinkSvg from "../Misc/external-link";
import { colors } from "../../theme";

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background: ${props => props.theme.brand};
  padding: 15px;
  align-items: center;
  position: absoule;
  .nav-link {
    font-size: 1.6rem;
    margin-right: 10px;
    font-weight: 500;
    color: white;
  }

  .selected-nav {
    border-bottom: 2px solid white;
  }

  somespace {
    width: 30px;
  }

  section {
    display: flex;
    align-items: center;
  }

  github {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    align-items: center;
    font-size: 1.8em;
  }

  githubtext {
    margin-right: 2px
  }

  @media screen and (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;

    section {
      margin-bottom: 10px;
    }

    span {
      display: none;
    }

  }
`

const Dot = (
  <span style={{marginLeft: 10, marginRight: 10, color: "white"}}>
    •
  </span>
)

class Navigation extends React.Component {

  selClass(name) {
    if (!this.props.location || !this.props.location.pathname) return "";
    return this.props.location.pathname.startsWith(`/${name}`) ?
      "selected-nav" :
      ""
  }

  render() {
    console.log(this.props)
    return (
      <NavContainer>
        <section>
          <Link to='/' >
            <img src={nextstrainLogo} alt="Logo" height='40px' />
          </Link>
          <somespace />
          <Link className={`nav-link ${this.selClass("about")}`} to='/about' > about </Link>
          {Dot}
          <Link className={`nav-link ${this.selClass("docs")}`} to='/docs/builds/lassa-build' > docs </Link>
          {Dot}
          <Link className={`nav-link ${this.selClass("blog")}`} to='/blog/2018/placeholder' > blog </Link>
          {Dot}
          <Link className={`nav-link ${this.selClass("reports")}`} to='/reports/01-flu-vaccine-selection/placeholder' > reports </Link>
          {Dot}
          <Link className={`nav-link ${this.selClass("methods")}`} to='/methods/chapter/placeholder' > methods </Link>
          {Dot}
          <Link className={`nav-link ${this.selClass("api")}`} to='/developer/misc/static-site-notes' > developer </Link>
        </section>
        <span>
          <github>
            <a className='nav-link' href='https://github.com/nextstrain' >
              <githubtext>
                github
              </githubtext>
              <ExternalLinkSvg cssProps={{verticalAlign: 3, color: colors.white}} />
            </a>
          </github>
        </span>
      </NavContainer>
    )
  }
}
// <span><UserLinks /></span>

export default Navigation
