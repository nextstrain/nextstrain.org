import { getCurrentUser, visibleGroups } from '../../user.js';


export function generateMetadata() {
  const currentUser = getCurrentUser();

  const title = currentUser
    ? `Logged in as ${currentUser.username}`
    : `Not logged in`;

  return {
    title,
  };
}


export default function Page() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return (
      <p>
        You’re not logged in.
        (<a href="/login">login</a>)
      </p>
    );
  }

  const privateGroups = visibleGroups(currentUser).filter(g => g.private);

  return (
    <>
      <p>
        You’re logged in as <strong>{currentUser.username}</strong>.
        (<a href="/logout">logout</a>)
      </p>

      <p>
        You have access to the following private Nextstrain groups, which each
        contain a collection of datasets and/or narratives:
      </p>

      <ul>
        {
          privateGroups.map(group => (
            <li key={group.name}>
              <a href={`/groups/${encodeURIComponent(group.name)}`}>{group.name}</a>
            </li>
          ))
        }
      </ul>
    </>
  );
}
