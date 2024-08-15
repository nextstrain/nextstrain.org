import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
const IndividualGroupPage = dynamic(() => import("../../src/sections/individual-group-page"), {ssr: false})
const GroupMembersPage = dynamic(() => import("../../src/sections/group-members-page.tsx"), {ssr: false})
const GroupSettingsPage = dynamic(() => import("../../src/sections/group-settings-page"), {ssr: false})


/**
 * NextJS dynamic routing doesn't allow us to set up routes where we have (e.g.)
 * groups/:groupName/settings -> <GroupSettingsPage>
 * groups/:groupName/settings/members -> <GroupMembersPage>
 * groups/:groupName[/*] -> <IndividualGroupPage>
 * so we use some JS routing here to serve the right component
 */
const Index = () => {
  const {query} = useRouter();
  if (!query.groupName) return null; // wait until query ready

  /* nextJs dynamic routing will set the part parts _beyond_ "groups/" as query.groupName */
  const groupName = query.groupName[0]
  const resourcePath = query.groupName.slice(1).join("/")

  switch(resourcePath) {
    case 'settings':
      return <GroupSettingsPage groupName={groupName}/>
    case 'settings/members':
      return <GroupMembersPage groupName={groupName}/>
    default:
      return <IndividualGroupPage
                groupName={groupName}
                resourcePath={resourcePath.length ? resourcePath : undefined}
             />
  }
}

export default Index;
