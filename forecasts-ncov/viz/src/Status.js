import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 25vw;
  font-size: 20px;
`;

const ErrorMessage = styled.div`
  color: red;
`;

export const Status = ({children, err}) => {
  if (err) console.error(err);
  return (
    <Container>
      {children}
      {err && <>
        <p>The following error message was reported:</p>
        <ErrorMessage>{String(err)}</ErrorMessage>
      </>}
    </Container>
  )
}