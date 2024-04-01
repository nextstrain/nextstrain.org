import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/pages/contact"), {ssr: false})
export default Index;
