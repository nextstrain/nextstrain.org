"use client";

import { notFound, useParams }from "next/navigation";

/**
  * A React Client Component to detect when an invalid `/staging/` URL
  * is requested, which calls the `notFound()` method to redirect to
  * the `not-found.tsx` component
  *
  * Note that any actually valid `/staging/<something>` URL will be
  * redirected at the Express router level, before the Next.js router
  * is engaged, so if we are trying to render a `/staging/<something>`
  * URL, it _is_ an error
 */
export default function ValidateStagingUrl(): null {
  const params = useParams();

  if (params && params["staging"]) {
    notFound();
  }
  else { return null; }

}
