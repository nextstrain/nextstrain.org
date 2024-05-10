/**
 * 
 * Example of  dynamic import but using ssr (which is the default dynamic import!)
 */

import dynamic from 'next/dynamic'
const Index = dynamic(() => import("../src/sections/pathogens"), {ssr: true})
export default Index;
