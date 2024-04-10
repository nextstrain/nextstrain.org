import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../../src/sections/influenza-page"), {ssr: false})
export default Index;
