import CommunityRepoPage from "../../../repo-page";

/**
 * Renders an error page for non-existent resource paths.
 *
 * This should only be reached if the server's router (src/routing) does not
 * find an existing resource at the path. Falls back to showing the repo page
 * with an error banner.
 */
export default function Page({
  params,
}: {
  params: {
    user: string;
    repo: string;
    path: string[];
  };
}): React.ReactElement {
  return (
    <CommunityRepoPage
      user={params.user}
      repo={params.repo}
      extra={params.path.join("/")}
    />
  );
}
