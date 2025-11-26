import React from "react";

import type { TitledMetadata } from "../../types";
import { ValidateUrl } from "../../../components/error-banner";

import StagingPageContent from "./content";

const title = "Staging Data";

export const metadata: TitledMetadata = {
  title,
};

/**
 * A React Server Component for `/staging`
 *
 * A note about how this page works:
 *
 * We expect three different types of requests for resources under
 * `/staging`:
 *
 * 1) Requests for real, existing datasets (e.g., `/staging/ebola`) —
 *    these requests are handled by the Express-level router, and this
 *    Next.js page never sees them
 *
 * 2) Requests for the plain `/staging` page — that request is handled
 *    by this page, and we expect it to return a resource listing of
 *    staging datasets, with an HTTP status code of 200
 *
 * 3) Requests for some longer URL that does NOT correspond to a real,
 *    existing dataset (e.g., `/staging/foo`) — in this case, we want
 *    to display the same resource listing as the base `/staging`
 *    page, but to also include an error banner indicating that the
 *    requested resource (`nextstrain.org/staging/foo` in our example)
 *    does not exist. We also want the HTTP status code for the
 *    response to this request to be a 404
 *
 * We accomplish this as follows:
 *
 * Requests of type #1 are handled completely at the Express level,
 * and this page never sees them.
 *
 * Requests of type #2 and type #3 _are_ handled by this page. It uses
 * the `<ValidateUrl>` component to detect whether the
 * requested URL was the plain `/staging` or whether there are
 * additional path components beyond that (again, `/staging/foo` in
 * our example). If there _are_ additional path elements,
 * `<ValidateUrl>` detects that and calls Next.js's
 * `notFound()` method, which results in the `./not-found.tsx` page
 * being rendered and returned. If there are not additional path
 * elements (i.e., if the request was for `/staging`),
 * `<ValidateUrl>` returns nothing, and the
 * `<StagingPageContent>` component delivers the desired resource
 * listing.
 *
 * If the `./not-found.tsx` page is rendered, it handles the display
 * of the error banner; it also uses the `<StagingPageContent>`
 * component to render the same resource listing as the default case.
 * However, because it has been invoked via the Next.js `notFound()`
 * method, it will return a 404 status code.
 */
export default function StagingPage(): React.ReactElement {
  return (
    <>
      <ValidateUrl stub="staging" />
      <StagingPageContent metadata={metadata} />
    </>
  );
}
