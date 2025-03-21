"use client";

import React from "react";
import { useParams } from "next/navigation";

import ErrorMessage from "../../../components/error-message";

/**
 * A React Client component that detects if the requested URL
 * contains path elements past `/pathogens`, and, if so, returns a
 * component that displays an error message banner. If additional
 * path elements are not detected, returns null.
 *
 * N.b., the way this component is used, we only render it when we've
 * already determined that there _is_ a need to display an error
 * message. In other words, it is fully expected that the `else`
 * branch of the conditional will never actually execute.
 */
export default function ErrorBanner(): React.ReactElement | null {
  const params = useParams();

  if (params && params["pathogens"]) {
    // n.b., I don't think `params["pathogens"]` is ever going to be
    // anything other than a list, but let's make the type checker
    // happy…
    const path =
      typeof params["pathogens"] === "string"
        ? params["pathogens"]
        : params["pathogens"].join("/");

    const resourceType = path.startsWith("narratives")
      ? "narrative"
      : "dataset";

    const title = `The pathogen ${resourceType} "nextstrain.org/pathogens/${path}" doesn't exist.`;
    const contents = `Here is the pathogens page instead.`;

    return <ErrorMessage title={title} contents={contents} />;
  } else {
    // this will never happen
    return null;
  }
}
