import React from "react";
import * as splashStyles from "../splash/styles";
import { Line } from "../../layouts/generalComponents";

// eslint-disable-next-line react/prefer-stateless-function
class CollapseTitle extends React.Component {
  render() {
    return (
      <div>
        <Line style={{margin: "10px 0px 10px 0px"}}/>
        <a href={null}>
          <splashStyles.H3>{this.props.title}</splashStyles.H3>
        </a>

        <br/>
      </div>);
  }
}

export default CollapseTitle;
