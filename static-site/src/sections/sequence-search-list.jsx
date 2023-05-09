import React from "react";
import {Link} from 'gatsby';
import styled from 'styled-components';
import {FaSearch} from "react-icons/fa";
import { SmallSpacer, MediumSpacer } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";

const Ul = styled.ul`
  font-size: 16px;
  line-height: 1.7;
  list-style: none;
`;

class ListSearchPages extends React.Component {
  render() {
    return (
      <GenericPage location={this.props.location}>
        <splashStyles.H2>
          Search datasets by sample name
        </splashStyles.H2>
        <SmallSpacer />
        <div className="row">
          <MediumSpacer />
          <div className="col-md-1"/>
          <div className="col-md-10">
            <Ul>
              {this.props.pageContext.searchPages && this.props.pageContext.searchPages.map((page) => (
                <li key={page.displayName}>
                  <Link to={`/search/${page.urlName}`}>
                    <FaSearch/>
                    {page.displayName}
                  </Link>
                </li>
              ))}
            </Ul>
          </div>
        </div>
      </GenericPage>
    );
  }
}
export default ListSearchPages;
