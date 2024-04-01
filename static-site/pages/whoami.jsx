import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/pages/whoami"), {ssr: false})
export default Index;
