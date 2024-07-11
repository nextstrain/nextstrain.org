import styled from "styled-components";

export const width = 160;
export const height = 160;

export const TileImg = styled.img`
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 3px 3px 3px 1px rgba(0, 0, 0, 0.15);
  max-height: 100%;
  width: 100%;
  background-color: ${(props) => props.color};
  float: right;
`;

export const TileInner = styled.div`
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`;

export const TileOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  height: ${height}px;
  width: ${width}px;
`;

export const TileName = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 500;
  font-size: 22px;
  position: absolute;
  border-radius: 3px;
  padding: 10px 20px 10px 10px;
  top: 20px;
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
