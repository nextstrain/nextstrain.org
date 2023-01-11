import {useEffect} from 'react';
import * as d3 from "d3";

export const useLegend = (d3Container, modelData) => {
  useEffect(() => {
    /* legend entries are arranged via the parent container's flexbox settings */

    const dom = d3.select(d3Container.current);
    dom.selectAll("*").remove();

    const containers = dom.selectAll("legendContainers")
      .data(modelData.get('variants'))
      .enter().append("div")
        .style("display", "flex")
        .style("align-items", "center") // legend swatches vertically centered with legend text

    containers.append("svg")
      .attr("width", 30)
      .attr("height", 30)
      .attr("viewBox", `0 0 30 30`)
      .append("circle")
        .attr("cx", 15)
        .attr("cy", 15)
        .attr("r", 8)
        .style("fill", (variant) => modelData.get('variantColors').get(variant) ||  modelData.get('variantColors').get('other'))
    
    containers.append("p")
      .text((variant) => modelData.get('variantDisplayNames').get(variant) || variant)

  }, [d3Container, modelData])
}
