import React, {useState, useEffect} from "react";
import styled from 'styled-components';
import MarkdownDisplay from "auspice/src/components/markdownDisplay";
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

  // If there was an error in displaying the customized splash page, print error to console.
  if (pageInfo.error) {
    console.log(pageInfo.error);
  }

  return (
    <>
      <NavBar sidebar={false}/>
      {errorMessage ? <ErrorMessage errorMessage={errorMessage}/> : null}
      <div className="static container">
        <Title avatarSrc={pageInfo.avatar}>
          {pageInfo.title}
          <Byline>{pageInfo.byline}</Byline>
          <Website>{pageInfo.website}</Website>
        </Title>
        {pageInfo.overview ?
          <MarkdownDisplay mdstring={pageInfo.overview}/> :
          null
        }
        <div style={{marginTop: "30px"}}/>
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
    margin-top: 0;
  `;
  return (
    <>
      <div style={{fontSize: "24px", marginTop: "10px"}}>
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
        <a href="/contact" style={{color: "inherit", textDecoration: "underline"}}>
          contact us
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
    width: 140px;
    margin-right: 20px;
    object-fit: contain;
  `;
  const TitleDiv = styled.div`
    && {
      font-weight: 500;
      font-size: 26px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  `;
  return (
    <div style={{display: "flex", justifyContent: "start", padding: "50px 0px 20px 0px"}}>
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
      font-weight: 400;
      line-height: 1.428;
      color: #A9ADB1;
    }
  `;
  return (<Div>{children}</Div>);
}

function Website({children}) {
  if (!children) return null;
  return (
    <a href={children}
      style={{color: "#A9ADB1", lineHeight: "1.0", textDecoration: "none", cursor: "pointer", fontWeight: "400", fontSize: "16px"}}
    >
      {children}
    </a>
  );
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
