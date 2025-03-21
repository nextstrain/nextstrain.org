"use client";

import React from "react";
import { useParams } from "next/navigation";

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
  contents,
  title,
}: {
  /** the initial URL part to check */
  stub: string;

  /** contents of the error message */
  contents?: React.ReactElement;

  /** title of the error message */
  title?: string;
}): React.ReactElement | null {
  const params = useParams();

  if (params && params[stub]) {
    // n.b., I don't think `params[stub]` is ever going to be
    // anything other than a list, but let's make the type checker
    // happy…
    const path = Array.isArray(params[stub])
      ? (params[stub] as string[]).join("/") // eslint-disable-line @typescript-eslint/consistent-type-assertions
      : (params[stub] as string); // eslint-disable-line @typescript-eslint/consistent-type-assertions

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
  } else {
    // this will never happen
    return null;
  }
}
