import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../../src/sections/sars-cov-2-forecasts-page"), {ssr: false})
export default Index;
