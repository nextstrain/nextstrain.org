import styled from "styled-components";

export const CardImg = styled.img`
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 3px 3px 3px 1px rgba(0, 0, 0, 0.15);
  max-height: 100%;
  width: 100%;
  background-color: ${(props) => props.color};
  float: right;
`;

export const CardInner = styled.div`
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`;

export const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  padding: 15px 0px 15px 0px;
  height: ${(props) => props.squashed ? "150px" : "250px"};
  width: 250px;
  @media (max-width: 992px) {
    height: ${(props) => props.squashed ? "150px" : "200px"};
    width: 200px;
  }
  @media (max-width: 768px) {
    height: 150px;
    width: 200px;
  }
  @media (max-width: 680px) {
    height: 120px;
    width: 100%;
    padding: 20px 0px 20px 0px;
  }
`;

export const CardTitle = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 500;
  font-size: ${(props) => props.squashed ? "22px" : "26px"};
  @media (max-width: 768px) {
    font-size: 22px;
  }
  position: absolute;
  border-radius: 3px;
  padding: 10px 20px 10px 20px;
  top: 40px;
  left: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
`;

export const BottomRightLabel = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 500;
  font-size: 26px;
  position: absolute;
  border-radius: 3px;
  padding: 10px 20px 10px 20px;
  bottom: 20px;
  right: 0px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
`;

export const MoreIconContainer = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export const SubText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-size: 16px;
  margin-top: 15px;
`;
