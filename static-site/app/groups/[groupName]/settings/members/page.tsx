'use server'
import { revalidatePath } from 'next/cache'
import { getRequestContext } from "../../../../../../src/requestContext";
import { actions, authorized, assertAuthorized } from "../../../../../../src/authz/index.js";
import { Group } from "../../../../../../src/groups.js";
import GroupMembersPage from "./group-members-page";
import { GroupMember, ErrorMessage } from "./types";



function getNextRequestContext() {
  let { user, group } = getRequestContext();
  // Need to create a new instance of the Group within Next.js
  // because Next.js has a different Group class definition
  // Additional details on Slack: <https://bedfordlab.slack.com/archives/C01LCTT7JNN/p1725399133264829>
  group = new Group(group.name)
  return { user, group }
}

export async function removeMember(member: GroupMember) {
  // TODO: This server action currently fails because it tries to make a
  // POST request to http://localhost:5000/groups/test/settings/members
  const { user, group } = getNextRequestContext();

  assertAuthorized(user, actions.Write, group);

  for (let role of member.roles) {
    await group.revokeRole(role, member.username);
  }

  revalidatePath(`/groups/${group.name}/settings/members`);
}


export default async function Page({ params }: { params: { groupName: string }}) {

  const { user, group } = getNextRequestContext();
  let errorMessage: ErrorMessage = {title:  "", contents: ""};
  let roles: string[] = [];
  let members: GroupMember[] = [];
  let canEditGroupMembers = false;

  if(authorized(user, actions.Read, group)) {
    roles = [...group.membershipRoles.keys()];
    const groupMembers = await group.members();
    /**
     * Convert roles Set to Array since Sets are not JSON serializable
     * This is avoided in the Express server by using a custom jsonReplacer
     * https://github.com/nextstrain/nextstrain.org/blob/175171e0e1c1b331538729a1168598227d08698d/src/routing/setup.js#L20
     */
    members = groupMembers.map(member => {
      member.roles = Array.from(member.roles)
      return member
    });

    if(authorized(user, actions.Write, group)) {
      canEditGroupMembers = true;
    }

  } else {
    errorMessage = {
      title: `Unauthorized to view ${group.name} members`,
      contents: "If you were recently added to the group, try logging out and logging back in."
    };
}

  return (
    <GroupMembersPage
      groupName={params.groupName}
      roles={roles}
      members={members}
      canEditGroupMembers={canEditGroupMembers}
      errorMessage={errorMessage}
    />
  )
}
