import { MissingRepoErrorPage } from "../../error-page";

/**
 * Renders an error page for incomplete user-only paths.
 */
export default function Page({
  params,
}: {
  params: {
    user: string;
  };
}): React.ReactElement {
  return <MissingRepoErrorPage />;
}
