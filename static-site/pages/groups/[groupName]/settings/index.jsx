import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
const GroupSettingsPage = dynamic(() => import("../../../../src/sections/group-settings-page"), {ssr: false})

const Index = () => {
  const {query} = useRouter();
  if (!query.groupName) return null; // wait until query ready

  return <GroupSettingsPage groupName={query.groupName} />;
}

export default Index;
