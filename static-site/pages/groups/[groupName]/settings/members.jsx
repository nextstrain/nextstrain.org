import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
const GroupMembersPage = dynamic(() => import("../../../../src/sections/group-members-page"), {ssr: false})

const Index = () => {
  const {query} = useRouter();
  if (!query.groupName) return null; // wait until query ready

  return <GroupMembersPage groupName={query.groupName} />;
}

export default Index;
