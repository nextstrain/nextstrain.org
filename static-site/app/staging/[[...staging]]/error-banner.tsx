"use client";

import React from "react";
import { useParams }from "next/navigation";

import ErrorMessage from "../../../components/error-message";

/**
  * A React Client Component to display an error banner when an
  *  invalid `/staging/` resource is provided.
  *
  * Note that any actually valid `/staging/<something>` URL will be
  * redirected before the Next.js app is engaged, so if we are trying
  * to render a `/staging/<something>` URL, it _is_ an error
 */
export default function ErrorBanner(): React.ReactElement|null {
  const params = useParams();

  if (params && params["staging"]) {
    // n.b., I don't think `params["staging"]` is ever going to be
    // anything other than a list, but let's make the type checker
    // happy…
    const path = typeof params["staging"] === "string" ? params["staging"] : params["staging"].join("/");

    const resourceType = path.startsWith("narratives") ? "narrative" : "dataset";

    const title = `The staging ${resourceType} "nextstrain.org/${path}" doesn't exist.`
    const contents = `Here is the staging page instead.`;

    return <ErrorMessage title={title} contents={contents}/>;
  }
  else { return null; }

}
