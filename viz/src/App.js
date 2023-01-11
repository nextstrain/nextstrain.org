import React from 'react';
import { Container } from './Container.js';
import { useDataFetch } from './dataFetch.js';
import { Panels } from "./Panels.js"
import {Status} from "./Status";
import { ErrorBoundary } from './ErrorBoundary.js';
import './fonts.css';

function App() {
  const [modelData, status] = useDataFetch()   
  return (
    <Container>
      {modelData ? (
        <ErrorBoundary>
          <Panels modelData={modelData}/>
        </ErrorBoundary>
      ) : 
        <Status err={status.err}>{status.msg}</Status>
      }
    </Container>
  );
}

export default App;
