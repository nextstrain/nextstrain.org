import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
const IndividualGroupPage = dynamic(() => import("../../../src/sections/individual-group-page"), {ssr: false})


const Index = () => {
  const {query} = useRouter();
  if (!query.groupName) return null; // wait until query ready

  return (
    <IndividualGroupPage
      groupName={query.groupName}
      resourcePath={query.dataset ? query.dataset : undefined}
    />
  );
}

export default Index;
