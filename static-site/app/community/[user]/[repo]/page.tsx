import CommunityRepoPage from "../../repo-page";

/**
 * Renders the community repo page.
 */
export default function Page({
  params,
}: {
  params: {
    user: string;
    repo: string;
  };
}): React.ReactElement {
  return (
    <CommunityRepoPage
      user={params.user}
      repo={params.repo}
    />
  );
}
