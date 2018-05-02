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
  background: #F6F6F6;
  padding: 5px;
  align-items: center;
  position: relative;
  .nav-link {
    font-size: 1.6rem;
    margin-right: 10px;
    font-weight: 500;
    color: black;
  }

  .selected-nav {
    border-bottom: 2px solid black;
    font-weight: 700;
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
  <span style={{marginLeft: 10, marginRight: 10, color: "black"}}>
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
    return (
      <NavContainer>
        <section>
          <Link to='/' >
            <img src={nextstrainLogo} alt="Logo" height='40px' />
          </Link>
          <somespace />
          <Link className={`nav-link ${this.selClass("about")}`} to='/about' > about </Link>
          {Dot}
          <Link className={`nav-link ${this.selClass("docs")}`} to='/docs/builds/zika-build' > docs </Link>
          {Dot}
          <Link className={`nav-link ${this.selClass("reports")}`} to='/reports/flu-vaccine-selection/2017-february' > reports </Link>
        </section>
        <span>
          <github>
            <a className='nav-link' href='https://github.com/nextstrain' >
              <githubtext>
                github
              </githubtext>
              <ExternalLinkSvg cssProps={{verticalAlign: 3, color: colors.black}} />
            </a>
          </github>
        </span>
      </NavContainer>
    )
  }
}
/* REMOVED HEADERS (these are still available if you know the URL)
{Dot}
<Link className={`nav-link ${this.selClass("blog")}`} to='/blog/2018/placeholder' > blog </Link>
{Dot}
<Link className={`nav-link ${this.selClass("methods")}`} to='/methods/chapter/placeholder' > methods </Link>
{Dot}
<Link className={`nav-link ${this.selClass("dev")}`} to='/developer/auspice/page-load' > developer </Link>
*/
export default Navigation
