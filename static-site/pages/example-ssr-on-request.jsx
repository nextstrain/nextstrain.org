
export const getServerSideProps = (async ({req}) => {
  console.log("getServerSideProps running");
  /* could run API queries here if needed, and they'll be made
  server-side upon request but will not be made by the client */
  return { props: { expressData: req.expressData} }
});
 

const Index = ({expressData}) => {

  return <div style={{fontSize: '20px', color: 'orange'}}>
    {`The express server is running in ${expressData.PRODUCTION ? 'production' : 'development'} mode`}
    <br/>
    {`The next.js server is running in ${expressData.STATIC_SITE_PRODUCTION ? 'production' : 'development'} mode`}
  </div>
}
export default Index;

