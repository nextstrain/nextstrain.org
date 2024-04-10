import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../../src/sections/staging-page"), {ssr: false})
export default Index;
