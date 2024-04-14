import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../../src/sections/core-files"), {ssr: false})
export default Index;
