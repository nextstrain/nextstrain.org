/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import { BeadPlot } from './BeadPlot';

const ModalContainer = styled.div`
  position: fixed;
  min-width: 80%;
  min-height: 80%;
  left: 10%;
  top: 10%;
  background-color: #bdd6de;
  border: 2px solid black;
`;



/**
 * TKTK
 * @param {function} props.dismissModal
 */
export const ResourceModal = ({data, dismissModal}) => {
  if (!data) return null;
  return (
    <ModalContainer onClick={dismissModal}>
      Hey! Modal!
      {JSON.stringify(data)}
      <BeadPlot versions={data.dates}/>
    </ModalContainer>
  )
}

