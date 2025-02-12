import * as d3 from "d3";

import { InternalError } from "../error-boundary";

import { dodge } from "./dodge";

const RAINBOW20 =   ["#511EA8", "#4432BD", "#3F4BCA", "#4065CF", "#447ECC", "#4C91BF", "#56A0AE", "#63AC9A", "#71B486", "#81BA72", "#94BD62", "#A7BE54", "#BABC4A", "#CBB742", "#D9AE3E", "#E29E39", "#E68935", "#E56E30", "#E14F2A", "#DC2F24"];

export default function modal_draw(ref, resource, lightGrey) {
  /* Note that _page_ resizes by themselves will not result in this function
  rerunning, which isn't great, but for a modal I think it's perfectly
  acceptable */
  const sortedDateStrings = [...resource.dates].sort();
  const flatData = sortedDateStrings.map(
    (version) => ({
      version,
      date: new Date(version),
    }),
  );

  if (flatData[0] === undefined) {
    throw new InternalError("Resource does not have any dates.");
  }

  const width = ref.clientWidth;
  const graphIndent = 20;
  const heights = {
    height:
      window.innerHeight > 900 ? 450 : window.innerHeight > 600 ? 250 : 200,
    marginTop: 20,
    marginAboveAxis: 30,
    marginBelowAxis: 50,
    hoverAreaAboveAxis: 25,
    marginBelowHoverBox: 10,
  };
  const unselectedOpacity = 0.3;

  const selection = d3.select(ref);
  selection.selectAll("*").remove();
  const svg = selection
    .append("svg")
    .attr("width", width)
    .attr("height", heights.height);

  /* Create the x-scale and draw the x-axis */
  const x = d3
    .scaleTime()
    .domain([flatData[0].date, new Date()]) // the domain extends to the present day
    .range([graphIndent, width - graphIndent]);
  svg
    .append("g")
    .attr(
      "transform",
      `translate(0, ${heights.height - heights.marginBelowAxis})`,
    )
    .call(d3.axisBottom(x).tickSize(15))
    .call((g) => {
      g.select(".domain").remove();
    });
  // .call((g) => {g.select(".domain").clone().attr("transform", `translate(0, -${heights.hoverAreaAboveAxis})`)})

  /** Elements which will be made visible on mouse-over interactions */
  const selectedVersionGroup = svg.append("g");
  selectedVersionGroup
    .append("line")
    .attr("class", "line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 100)
    .attr("y2", heights.height - heights.marginBelowAxis)
    .style("stroke", "black")
    .style("stroke-width", "2")
    .style("opacity", 0);
  selectedVersionGroup
    .append("text")
    .attr("class", "message")
    .attr("x", 0)
    .attr("y", heights.height - heights.marginBelowAxis - 6) // offset to bump text up
    .style("font-size", "1.8rem")
    .style("opacity", 0);

  /**
   * We use Observable Plot's `dodge` function to apply vertical jitter to the
   * snapshot circles. To calculate the most appropriate radius we use a simple
   * iterative approach. The current parameters mean the resulting radius will
   * be bounded between 4px & 20px
   */
  const availBeeswarmHeight =
    heights.height -
    heights.marginTop -
    heights.marginAboveAxis -
    heights.marginBelowAxis;
  let radius = 12;
  const padding = 1;
  let nextRadius = radius;
  let iterCount = 0;
  let beeswarmData;
  let beeswarmHeight = 0;
  let spareHeight = availBeeswarmHeight - beeswarmHeight - radius;
  const maxIter = 5;
  const radiusJump = 2;
  while (iterCount++ < maxIter && spareHeight > 50) {
    const nextBeeswarmData = dodge(flatData, {
      radius: nextRadius * 2 + padding,
      x: (d) => x(d["date"]),
    });
    const nextBeeswarmHeight = d3.max(nextBeeswarmData.map((d) => d.y));
    const nextSpareHeight =
      availBeeswarmHeight - nextBeeswarmHeight - nextRadius;
    if (nextSpareHeight <= spareHeight && nextSpareHeight > 0) {
      beeswarmData = nextBeeswarmData;
      beeswarmHeight = nextBeeswarmHeight;
      spareHeight = nextSpareHeight;
      radius = nextRadius;
      nextRadius += radiusJump;
    } else {
      nextRadius -= radiusJump;
    }
  }

  /** draw the beeswarm plot */
  const beeswarm = svg
    .append("g")
    .selectAll("circle")
    .data(beeswarmData)
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr(
      "cy",
      (d) =>
        heights.height -
        heights.marginBelowAxis -
        heights.marginAboveAxis -
        radius -
        padding -
        d.y,
    )
    .attr("r", radius)
    .attr("fill", color)
    // @ts-expect-error no-unused-vars
    .on("mouseover", function (e, d) {
      /* lower opacity of non-hovered, increase radius of hovered circle */
      beeswarm.join(
        // @ts-expect-error no-unused-vars
        (enter) => {} /* eslint-disable-line */,
        (update) => selectSnapshot(update, d),
      );
      /* update the vertical line + text which appears on hover */
      const selectedCircleX = d.x;
      const textR = selectedCircleX * 2 < width;
      selectedVersionGroup
        .select(".line")
        .attr("x1", selectedCircleX)
        .attr("x2", selectedCircleX)
        .attr(
          "y1",
          heights.height -
            heights.marginBelowAxis -
            heights.marginAboveAxis -
            radius -
            padding -
            d.y,
        )
        .style("opacity", 1);
      selectedVersionGroup
        .select(".message")
        .attr("x", selectedCircleX + (textR ? 5 : -5))
        .style("opacity", 1)
        .style("text-anchor", textR ? "start" : "end")
        .text(`Snapshot from ${prettyDate(d.data.version)} (click to load)`);
    })
    .on("mouseleave", function () {
      beeswarm.join(
        // @ts-expect-error no-unused-vars
        (enter) => {} /* eslint-disable-line */,
        (update) => resetBeeswarm(update),
      );
      /* hide the vertical line + text which appeared on mouseover */
      selectedVersionGroup.selectAll("*").style("opacity", 0);
    })
    // @ts-expect-error no-unused-vars
    .on("click", function (e, d) {
      window.open(`/${resource.name}@${d.data.version}`, "_blank"); // TEST!
    });

  /**
   * Draw the light-grey bar which doubles as the axis. The mouseover behaviour
   * here is to select & show the appropriate snapshot relative to the mouse
   * position
   */
  svg
    .append("g")
    .append("rect")
    .attr("x", x.range()[0])
    .attr(
      "y",
      heights.height - heights.marginBelowAxis - heights.hoverAreaAboveAxis,
    )
    .attr("width", x.range()[1] - x.range()[0])
    .attr("height", heights.hoverAreaAboveAxis)
    .attr("stroke", "black")
    .attr("fill", lightGrey)
    .on("mousemove", function (e) {
      const { datum, hoveredDateStr } = getVersion(e);
      beeswarm.join(
        // @ts-expect-error no-unused-vars
        (enter) => {} /* eslint-disable-line */,
        (update) => selectSnapshot(update, datum),
      );
      /* update the vertical line + text which appears on hover */
      const selectedCircleX = datum.x;
      const textR = selectedCircleX * 2 < width;
      const prettyDates = prettyDate(hoveredDateStr, datum.data.version);
      selectedVersionGroup
        .select(".line")
        .attr("x1", selectedCircleX)
        .attr("x2", selectedCircleX)
        .attr(
          "y1",
          heights.height -
            heights.marginBelowAxis -
            heights.marginAboveAxis -
            radius -
            padding -
            datum.y,
        )
        .style("opacity", 1);
      selectedVersionGroup
        .select(".message")
        .attr("x", selectedCircleX + (textR ? 5 : -5))
        .style("opacity", 1)
        .style("text-anchor", textR ? "start" : "end")
        .text(
          `On ${prettyDates[0]} the latest snapshot was from ${prettyDates[1]} (click to load)`,
        );
    })
    .on("mouseleave", function () {
      beeswarm.join(
        // @ts-expect-error no-unused-vars
        (enter) => {} /* eslint-disable-line */,
        (update) => resetBeeswarm(update),
      );
      selectedVersionGroup.selectAll("*").style("opacity", 0);
    })
    .on("click", function (e) {
      const { datum } = getVersion(e);
      window.open(`/${resource.name}@${datum.data.version}`, "_blank");
    });

  function selectSnapshot(selection, selectedDatum) {
    selection // fn is almost identical to beeswarm mouseover
      .attr("opacity", (d) => (d === selectedDatum ? 1 : unselectedOpacity))
      .call((selection) =>
        selection
          .transition()
          .delay(0)
          .duration(150)
          .attr("r", (d) => (d === selectedDatum ? radius * 2 : radius)),
      );
  }

  function resetBeeswarm(selection) {
    selection
      .attr("opacity", 1)
      .call((update) =>
        update.transition().delay(0).duration(150).attr("r", radius),
      );
  }

  /**
   * Given a mouse event in the x-axis' range, find the snapshot which would
   * have been the latest at that point in time
   */
  function getVersion(mouseEvent) {
    const hoveredDate = x.invert(d3.pointer(mouseEvent)[0]);
    const hoveredDateStr = _toDateString(hoveredDate);
    const versionIdx = d3.bisect(sortedDateStrings, hoveredDateStr) - 1;
    const datum = beeswarmData[versionIdx];
    return { datum, hoveredDateStr };
  }

  const dateWithYear = d3.utcFormat("%B %d, %Y");
  const dateSameYear = d3.utcFormat("%B %d");
  function prettyDate(mainDate, secondDate) {
    const d1 = dateWithYear(new Date(mainDate));
    if (!secondDate) return d1;
    const d2 = (
      mainDate.slice(0, 4) === secondDate.slice(0, 4)
        ? dateSameYear
        : dateWithYear
    )(new Date(secondDate));
    return [d1, d2];
  }

  /* Return the appropriate nextstrain rainbow colour of a circle via it's d.x
  position relative to the x-axis' range */
  function color(d) {
    const _xrange = x.range();
    let idx = Math.floor(
      ((d.x - _xrange[0]) / (_xrange[1] - _xrange[0])) * RAINBOW20.length,
    );
    if (idx === RAINBOW20.length) idx--;
    return RAINBOW20[idx];
  }

  function _toDateString(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
}
