"use client";

import React from "react";
import { usePathname } from "next/navigation";

import ErrorMessage from "../error-message";

/**
 * Renders an error message banner for an invalid path.
 */
export function ErrorBanner({
  stub,
  contents,
}: {
  /** the initial URL part */
  stub: string;

  /** contents of the error message */
  contents?: React.ReactElement;
}): React.ReactElement {
  const path = usePathname().replace(new RegExp(`^/${stub}/`), "");
  const resourceType = path.startsWith("narratives")
    ? "narrative"
    : "dataset";
  const errorTitle = `The ${stub} ${resourceType} "nextstrain.org/${stub}/${path}" doesn't exist.`;
  const errorContents = contents
    ? contents
    : <p>Here is the {stub} page instead.</p>;

  return <ErrorMessage title={errorTitle} contents={errorContents} />;
}
