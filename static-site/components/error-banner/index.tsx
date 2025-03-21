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
export default function ErrorBanner({
  stub,
}: {
  /** the initial URL part to check */
  stub: string;
}): React.ReactElement | null {
  const params = useParams();

  if (params && params[stub]) {
    // n.b., I don't think `params[stub]` is ever going to be
    // anything other than a list, but let's make the type checker
    // happy…
    let path: string;
    if (Array.isArray(params[stub])) {
      path = (params[stub] as string[]).join("/"); // eslint-disable-line @typescript-eslint/consistent-type-assertions
    } else {
      path = params[stub] as string; // eslint-disable-line @typescript-eslint/consistent-type-assertions
    }

    const resourceType = path.startsWith("narratives")
      ? "narrative"
      : "dataset";

    const title = `The ${stub} ${resourceType} "nextstrain.org/${stub}/${path}" doesn't exist.`;
    const contents = `Here is the ${stub} page instead.`;

    return <ErrorMessage title={title} contents={contents} />;
  } else {
    // this will never happen
    return null;
  }
}
