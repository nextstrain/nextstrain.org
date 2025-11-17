import React from "react";
import { Metadata } from "next";

import { ValidateUrl } from "../../../components/error-banner";

import NextcladePageContent from "./content";

const title = "Nextclade reference trees";

export const metadata: Metadata = {
  title,
};

/**
 * A React Server Component for `/nextclade`
 *
 * A note about how this page works:
 *
 * We expect three different types of requests for resources under
 * `/nextclade`:
 *
 * 1) Requests for real, existing datasets (e.g., `/nextclade/measles/genome/WHO-2012`) —
 *    these requests are handled by the Express-level router, and this
 *    Next.js page never sees them
 *
 * 2) Requests for the plain `/nextclade` page — that request is handled
 *    by this page, and we expect it to return a resource listing of
 *    Nextclade reference trees, with an HTTP status code of 200
 *
 * 3) Requests for some longer URL that does NOT correspond to a real,
 *    existing dataset (e.g., `/nextclade/foo`) — in this case, we want
 *    to display the same resource listing as the base `/nextclade`
 *    page, but to also include an error banner indicating that the
 *    requested resource (`nextstrain.org/nextclade/foo` in our example)
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
 * requested URL was the plain `/nextclade` or whether there are
 * additional path components beyond that (again, `/nextclade/foo` in
 * our example). If there _are_ additional path elements,
 * `<ValidateUrl>` detects that and calls Next.js's
 * `notFound()` method, which results in the `./not-found.tsx` page
 * being rendered and returned. If there are not additional path
 * elements (i.e., if the request was for `/nextclade`),
 * `<ValidateUrl>` returns nothing, and the
 * `<NextcladePageContent>` component delivers the desired resource
 * listing.
 *
 * If the `./not-found.tsx` page is rendered, it handles the display
 * of the error banner; it also uses the `<NextcladePageContent>`
 * component to render the same resource listing as the default case.
 * However, because it has been invoked via the Next.js `notFound()`
 * method, it will return a 404 status code.
 */
export default function NextcladePage(): React.ReactElement {
  return (
    <>
      <ValidateUrl stub="nextclade" />
      <NextcladePageContent metadata={metadata} />
    </>
  );
}
