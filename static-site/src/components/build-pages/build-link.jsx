import React from "react";
import { FaChartArea } from "react-icons/fa";
import * as splashStyles from "../splash/styles";

const buildLink = (build) => (
  <splashStyles.SitRepTitle key={build.url}>
    {build.url === undefined ? build.name : <div>
      <a href={build.url}>
        <FaChartArea />
        {` ${build.name} `}
      </a>
      (
      {build.org.url === undefined ? build.org.name : <a href={build.org.url}>{build.org.name}</a>
      }
      )
    </div>}
  </splashStyles.SitRepTitle>
);

export default buildLink;
