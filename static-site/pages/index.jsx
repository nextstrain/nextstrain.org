import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/pages/index"), {ssr: false})
export default Index;
