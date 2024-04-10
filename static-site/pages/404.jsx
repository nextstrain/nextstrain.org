import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/pages/404"), {ssr: false})
export default Index;
