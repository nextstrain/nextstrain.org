'use server'
import { getRequestContext } from "../../../../../../src/requestContext";
import { actions, authorized } from "../../../../../../src/authz/index.js";
import { Group } from "../../../../../../src/groups.js";
import GroupMembersPage from "./group-members-page";
import { GroupMember, ErrorMessage } from "./types";


export default async function Page({ params }: { params: { groupName: string }}) {

  const { user, group } = getRequestContext();

  // Need to create a new instance of the Group within Next.js
  // because Next.js has a different Group class definition
  // Additional details on Slack: <https://bedfordlab.slack.com/archives/C01LCTT7JNN/p1725399133264829>
  let newGroup = new Group(group.name)
  let errorMessage: ErrorMessage = {title:  "", contents: ""};
  let roles: string[] = [];
  let members: GroupMember[] = [];

  if(authorized(user, actions.Read, newGroup)) {
    roles = [...newGroup.membershipRoles.keys()];
    const groupMembers = await newGroup.members();
    /**
     * Convert roles Set to Array since Sets are not JSON serializable
     * This is avoided in the Express server by using a custom jsonReplacer
     * https://github.com/nextstrain/nextstrain.org/blob/175171e0e1c1b331538729a1168598227d08698d/src/routing/setup.js#L20
     */
    members = groupMembers.map(member => {
      member.roles = Array.from(member.roles)
      return member
    });
  } else {
    errorMessage = {
      title: `Unauthorized to view ${newGroup.name} members`,
      contents: "If you were recently added to the group, try logging out and logging back in."
    };
}

  return (
    <GroupMembersPage
      groupName={params.groupName}
      roles={roles}
      members={members}
      errorMessage={errorMessage}
    />
  )
}
