"use client";

import React from "react";

import ErrorMessage from "../error-message";

/**
 * A React Client component that detects if the requested URL
 * contains path elements past the provided stub, and, if so, returns a
 * component that displays an error message banner. If additional
 * path elements are not detected, returns null.
 *
 * N.b., the way this component is used, we only render it when we've
 * already determined that there _is_ a need to display an error
 * message. In other words, it is fully expected that the `else`
 * branch of the conditional will never actually execute.
 */
export function ErrorBanner({
  stub,
  path,
  contents,
  title,
}: {
  /** the initial URL part to check */
  stub: string;

  /** the invalid path */
  path: string;

  /** contents of the error message */
  contents?: React.ReactElement;

  /** title of the error message */
  title?: string | React.ReactElement;
}): React.ReactElement {

  const resourceType = path.startsWith("narratives")
    ? "narrative"
    : "dataset";
  const errorTitle = title
    ? title
    : `The ${stub} ${resourceType} "nextstrain.org/${stub}/${path}" doesn't exist.`;
  const errorContents = contents
    ? contents
    : <p>Here is the {stub} page instead.</p>;

  return <ErrorMessage title={errorTitle} contents={errorContents} />;
}
