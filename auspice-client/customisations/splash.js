import React, {useState, useEffect} from "react"; // eslint-disable-line
import styled from 'styled-components'; // eslint-disable-line
import NavBar from "./navbar";


/**
 * The defaultPageInfo will only be displayed on two conditions:
 * (1) the router has decided that the pathname should be handled by the auspice client and
 * (2) the appropriate `getDataset` requests have failed."
 * Note that there will also be an errorMessage displayed in this case!
 */
const defaultPageInfo = {
  showDatasets: true,
  showNarratives: true
};


const Splash = ({available, browserDimensions, dispatch, errorMessage, changePage}) => {

  const [pageInfo, setPageInfo] = useState(defaultPageInfo);
  useEffect(
    () => {getSourceInfo(setPageInfo);},
    [setPageInfo]
  );

  return (
    <>
      <NavBar sidebar={false}/>
      {errorMessage ? <ErrorMessage errorMessage={errorMessage}/> : null}
      <div className="static container">
        <Title avatarSrc={pageInfo.avatar}>
          {pageInfo.title}
        </Title>
        <Byline>{pageInfo.byline}</Byline>
        {pageInfo.showDatasets ?
          <ListAvailable type="datasets" data={available.datasets} width={browserDimensions.width} dispatch={dispatch} changePage={changePage}/> :
          null
        }
        {pageInfo.showNarratives ?
          <ListAvailable type="narratives" data={available.narratives} width={browserDimensions.width} dispatch={dispatch} changePage={changePage}/> :
          null
        }
      </div>
    </>
  );
};


/* lifted from auspice's default splash page */
function ListAvailable({type, data, width, dispatch, changePage}) {
  const numCols = width > 1000 ? 3 : width > 750 ? 2 : 1;
  const ColumnList = styled.ul`
    -moz-column-count: ${numCols};
    -moz-column-gap: 20px;
    -webkit-column-count: ${numCols};
    -webkit-column-gap: 20px;
    column-count: ${numCols};
    column-gap: 20px;
  `;
  return (
    <>
      <div style={{fontSize: "26px"}}>
        {`Available ${type}:`}
      </div>
      <div style={{display: "flex", flexWrap: "wrap"}}>
        <div style={{flex: "1 50%", minWidth: "0"}}>
          {(data && data.length) ? (
            <ColumnList>
              {data.map((d) => formatDataset(d.request, dispatch, changePage))}
            </ColumnList>
          ) :
            "None found."
          }
        </div>
      </div>
    </>
  );
}

function ErrorMessage({errorMessage}) {
  const FixedBanner = styled.div`
    left: 0px;
    width: 100%;
    background-color: #E04929;
    color: white;
    font-size: 16px;
    padding: 15px 5%;
    margin: 25px 0px;
  `;
  return (
    <FixedBanner>
      There seems to have been an error accessing that dataset.
      <p style={{fontSize: "14px"}}>
        {`Details: ${errorMessage}. Please `}
        <a href={"mailto:hello@nextstrain.org"} style={{color: "inherit", textDecoration: "underline"}}>
          email us
        </a>
        {` if you think this is a bug.`}
      </p>
    </FixedBanner>
  );
}

/* lifted from auspice's default splash page */
function formatDataset(requestPath, dispatch, changePage) {
  return (
    <li key={requestPath}>
      <div
        style={{color: "#5097BA", textDecoration: "none", cursor: "pointer", fontWeight: "400", fontSize: "94%"}}
        onClick={() => dispatch(changePage({path: requestPath, push: true}))}
      >
        {requestPath}
      </div>
    </li>
  );
}


function Title({avatarSrc, children}) {
  if (!children) return null;
  const AvatarImg = styled.img`
    width: 120px;
    margin-right: 5%;
  `;
  const TitleDiv = styled.div`
    && {
      font-weight: 500;
      font-size: 150%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  `;
  return (
    <div style={{display: "flex", justifyContent: "center", padding: "5% 0px"}}>
      {avatarSrc ?
        <AvatarImg alt="avatar" src={avatarSrc}/> :
        null
      }
      <TitleDiv>
        {children}
      </TitleDiv>
    </div>
  );
}

function Byline({children}) {
  if (!children) return null;
  const Div = styled.div`
    && {
      max-width: 70%;
      margin: 20px auto 40px auto;
      text-align: center;
      font-weight: 400;
      line-height: 1.428;
    }
  `;
  return (<Div>{children}</Div>);
}

async function getSourceInfo(setPageInfo) {
  const pageInfo = await (
    fetch(`/charon/getSourceInfo?prefix=${window.location.pathname}`)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }
        return res;
      })
      .then((res) => res.json())
  );
  setPageInfo(pageInfo);
}

export default Splash;
