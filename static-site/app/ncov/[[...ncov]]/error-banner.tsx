"use client";

import React from "react";
import { useParams } from "next/navigation";

import ErrorMessage from "../../../components/error-message";

/**
 * A React Client component that detects if the requested URL
 * contains path elements past `/ncov`, and, if so, returns a
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

  if (params && params["ncov"]) {
    // n.b., I don't think `params["ncov"]` is ever going to be
    // anything other than a list, but let's make the type checker
    // happy…
    const path =
      typeof params["ncov"] === "string"
        ? params["ncov"]
        : params["ncov"].join("/");

    const resourceType = path.startsWith("narratives")
      ? "narrative"
      : "dataset";

    const title = `The ${resourceType} "nextstrain.org/ncov/${path}" doesn't exist.`;
    const contents = (
      <p>
        {`Here is the SARS-CoV-2 page, where we have listed featured datasets,
        narratives, and resources related to SARS-CoV-2. Note that some SARS-CoV-2
        datasets may not be listed here. For a more comprehensive list of
        Nextstrain-maintained (including SARS-CoV-2) datasets,
        check out `}
        <a href="/pathogens">nextstrain.org/pathogens</a>.
      </p>
    );

    return <ErrorMessage title={title} contents={contents} />;
  } else {
    // this will never happen
    return null;
  }
}
