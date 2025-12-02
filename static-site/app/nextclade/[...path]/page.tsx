import NextcladePageContent from "../content";
import { metadata } from "../page";

/**
 * Valid dataset requests (e.g., `/nextclade/measles/genome/WHO-2012`) are
 * handled by the Express-level router and never reach Next.js. This page is
 * reached when the router does not find an existing resource at the path.
 *
 * It displays the regular nextclade page content with an error banner
 * indicating that the requested resource does not exist. However, because it
 * has been invoked via the Next.js `notFound()` method, it will return a 404
 * status code.
 */
export default function Page({
  params
}: {
  params: {
    path: string[]
  }
}): React.ReactElement {
  return (
    <NextcladePageContent
      metadata={metadata}
      nonExistentPath={params.path.join("/")}
    />
  );
}
