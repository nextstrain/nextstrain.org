import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/sections/pathogens"), {ssr: false})
export default Index;
