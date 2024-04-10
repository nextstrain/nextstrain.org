import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/pages/groups"), {ssr: false})
export default Index;
