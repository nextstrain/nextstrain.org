import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/pages/philosophy"), {ssr: false})
export default Index;
