"use client";

import { notFound, useParams }from "next/navigation";

/**
  * A React Client Component to detect when an invalid `/pathogens/` URL
  * is requested, which calls the `notFound()` method to redirect to
  * the `not-found.tsx` component
  *
  * Note that any actually valid `/pathogens/<something>` URL will be
  * redirected at the Express router level, before the Next.js router
  * is engaged, so if we are trying to render a `/pathogens/<something>`
  * URL, it _is_ an error
 */
export default function ValidateStagingUrl(): null {
  const params = useParams();

  if (params && params["pathogens"]) {
    notFound();
  }
  else { return null; }

}
