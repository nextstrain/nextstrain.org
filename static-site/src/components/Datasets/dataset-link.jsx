import React from "react";
import { FaChartArea } from "react-icons/fa";
import * as splashStyles from "../splash/styles";

const datasetLink = (dataset) => (
  <splashStyles.SitRepTitle key={dataset.url}>
    {dataset.url === undefined ? dataset.name : <div>
      <a href={dataset.url}>
        <FaChartArea />
        {` ${dataset.name} `}
      </a>
      (
      {dataset.org.url === undefined ? dataset.org.name : <a href={dataset.org.url}>{dataset.org.name}</a>
      }
      )
    </div>}
  </splashStyles.SitRepTitle>
);

export default datasetLink;
