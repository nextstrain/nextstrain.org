import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/pages/team"), {ssr: false})
export default Index;
