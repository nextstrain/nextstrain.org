"use client";

import React from "react";
import { useParams } from "next/navigation";

import ErrorMessage from "../../../components/error-message";

/**
 * A React Client component that detects if the requested URL
 * contains path elements past `/staging`, and, if so, returns a
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

  if (params && params["staging"]) {
    // n.b., I don't think `params["staging"]` is ever going to be
    // anything other than a list, but let's make the type checker
    // happy…
    const path =
      typeof params["staging"] === "string"
        ? params["staging"]
        : params["staging"].join("/");

    const resourceType = path.startsWith("narratives")
      ? "narrative"
      : "dataset";

    const title = `The staging ${resourceType} "nextstrain.org/staging/${path}" doesn't exist.`;
    const contents = <p>Here is the staging page instead.</p>;

    return <ErrorMessage title={title} contents={contents} />;
  } else {
    // this will never happen
    return null;
  }
}
