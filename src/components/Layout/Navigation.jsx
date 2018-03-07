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

  .nav-link {
    font-size: 1.6rem;
    margin-right: 10px;
    font-weight: 300;
    color: black;
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

class Navigation extends React.Component {

  render() {
    return (
      <NavContainer>
        <section>
          <Link to='/' >
            <img src={nextstrainLogo} alt="Logo" height='40px' />
          </Link>
          <somespace />
          <Link className='nav-link' to='docs/misc/narrative-markdown-description' > DOCS </Link>
          <span style={{marginLeft: 10, marginRight: 10}}>•</span>
          <Link className='nav-link' to='tutorial/sacra/sacra-introduction' > TUTORIAL </Link>
          <span style={{marginLeft: 10, marginRight: 10}}>•</span>
          <Link className='nav-link' to='/' > POSTS </Link>
        </section>
        <span>
          <github>
            <Link className='nav-link' to='https://github.com/nextstrain' >
              <githubtext>
                github
              </githubtext>
              <ExternalLinkSvg cssProps={{verticalAlign: 3, color: colors.white}} />
            </Link>
          </github>
        </span>
      </NavContainer>
    )
  }
}
// <span><UserLinks /></span>

export default Navigation
