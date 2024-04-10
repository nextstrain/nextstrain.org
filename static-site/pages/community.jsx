import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/sections/community-page"), {ssr: false})
export default Index;
