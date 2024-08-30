import { getRequestContext } from "../../../../../../src/requestContext";
import { actions, authorized } from "../../../../../../src/authz/index.js";
import GroupMembersPage from "./group-members-page";


export default function Page({ params }: { params: { groupName: string }}) {

  async function checkAuth() {
    'use server'
    const { user, group } = getRequestContext();

    console.log(user)
    console.log(group)

    if(authorized(user, actions.Write, group)) {
      console.log("AUTH")
      return true
    }
    return false
  }

  console.log(checkAuth())


  return (
    <GroupMembersPage groupName={params.groupName}/>
  )
}
