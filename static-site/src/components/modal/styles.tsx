import styled from 'styled-components';

const lightGrey = 'rgba(0,0,0,0.1)';
export const Background = styled.div`
  position: fixed;
  min-width: 100%;
  min-height: 100%;
  overflow: hidden;
  left: 0;
  top: 0;
  background-color: ${lightGrey};
`

export const ModalContainer = styled.div`
  position: fixed;
  min-width: 80%;
  max-width: 80%;
  min-height: 80%;
  left: 10%;
  top: 10%;
  background-color: #fff;
  border: 2px solid black;
  font-size: 18px;
  padding: 20px;
  z-index: 100;
`;

export const Title = styled.div`
  font-size: 20px;
  font-weight: 500;
  padding-bottom: 15px;
`
