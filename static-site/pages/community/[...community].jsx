import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
const MainCommunityPage = dynamic(() => import("../../src/sections/community-page"), {ssr: false})
const SpecificCommunityPage = dynamic(() => import("../../src/sections/community-repo-page"), {ssr: false})


/**
 * This page implements the following routing for community URLs:
 * /community/:something -> MainCommunityPage
 * /community/:userName/:repoName[/*] -> SpecificCommunityPage
 * /community/narratives/:userName -> MainCommunityPage
 * /community/narratives/:userName/:repoName[/*] -> SpecificCommunityPage
 * 
 * Note that the URL path '/community' is already handled by /pages/community.jsx
 */
const Index = () => {
  const router = useRouter();  
  if (!router.query.community) return null; // wait until query ready
  const parts = router.query.community.slice();
  let isNarrative = false;
  if (parts[0]==='narratives') {
    isNarrative = true;
    parts.shift()
  }
  const [ userName, repoName, ...rest ] = parts;
  const resourcePath = router.asPath.replace(/^\//, '');

  if (!(userName && repoName)) {
    return (<MainCommunityPage resourcePath={resourcePath}/>)
  }

  return <SpecificCommunityPage
    isNarrative={isNarrative}
    userName={userName} repoName={repoName}
    resourcePath={resourcePath} nonDefaultResourcePathParts={rest}/>
}

export default Index;