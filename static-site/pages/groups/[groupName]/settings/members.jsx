import dynamic from 'next/dynamic'
import { useRouter, withRouter } from 'next/router'
import GroupMembersPage from "../../../../src/sections/group-members-page";
// GenericPage needs to be loaded client-side because NavBar uses Router
const GenericPage = dynamic(() => import('../../../../src/layouts/generic-page'), {ssr: false});

const Index = ({ groupName, roles, members, canEditGroupMembers }) => {
  return (
  <GenericPage>
    <GroupMembersPage groupName={groupName} roles={roles} members={members} canEditGroupMembers={canEditGroupMembers} />
  </GenericPage>
  )
}

export const getServerSideProps = async ({ params, req, res, query}) => {
  /**
   * If an error occurs within getServerSideProps, then the 500 page is shown
   * <https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props#error-handling>
   *
   * NextJS has a default 500 page, but we can customize it if desired
   * <https://nextjs.org/docs/pages/building-your-application/routing/custom-error#500-page>
   */
  const group = req.context.group;
  req.authz.assertAuthorized(req.user, req.authz.actions.Read, group);
  const roles = [...group.membershipRoles.keys()].map(name => ({name}));
  const members = await group.members()
  /**
   * Convert roles Set to Array since Sets are not JSON serializable
   * This is avoided in the Express server by using a custom jsonReplacer
   * https://github.com/nextstrain/nextstrain.org/blob/175171e0e1c1b331538729a1168598227d08698d/src/routing/setup.js#L20
   */
  members.forEach(member => member.roles = Array.from(member.roles));

  let canEditGroupMembers = false;
  if (req.authz.authorized(req.user, req.authz.actions.Write, group)) {
    canEditGroupMembers = true;
  }
  return { props: { groupName: params.groupName, roles, members, canEditGroupMembers} };
}

export default Index;
