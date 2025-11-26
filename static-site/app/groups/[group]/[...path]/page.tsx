import IndividualGroupPage from "../page"

// This should only be reached if the server's router (src/routing) does not
// find an existing resource at the path.
export default function Page({
  params
}: {
  params: {
    group: string
    path: string[]
  }
}): React.ReactElement {
  return (
    <IndividualGroupPage
      params={{ group: params.group }}
      nonExistentPath={params.path.join("/")}
    />
  )
}
