"use client";

import { notFound, useParams }from "next/navigation";

/**
  * A React Client Component to detect when an invalid `/sars-cov-2/` URL
  * is requested, which calls the `notFound()` method to redirect to
  * the `not-found.tsx` component
  *
  * Note that any actually valid `/sars-cov-2/<something>` URL will be
  * redirected at the Express router level, before the Next.js router
  * is engaged, so if we are trying to render a `/sars-cov-2/<something>`
  * URL, it _is_ an error
 */
export default function ValidateSarsUrl(): null {
  const params = useParams();

  if (params && params["sars-cov-2"]) {
    notFound();
  }
  else { return null; }

}
