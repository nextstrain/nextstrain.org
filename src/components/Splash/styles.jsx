import styled from "styled-components"

const darkGrey = "#333";

export const Container = styled.div`
  padding-left: 25px;
  padding-right: 25px;
`

export const Flex = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
`

export const Bigspacer = styled.div`
  height: 30px;
`

export const StyledDiv = styled.div`
  text-align: justify;
  font-size: 16px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: 300;
  color: var(--darkGrey);
  line-height: 1.42857143;
`

export const H1 = styled.div`
  text-align: center;
  font-size: 38px;
  line-height: 32px;
  font-weight: 300;
  color: ${darkGrey};
  min-width: 240px;
  margin-top: 40px;
  margin-bottom: 30px;
`
//
// export const H2 = styled.div`
//   text-align: left;
//   font-size: 16px;
//   line-height: 28px;
//   margin-top: 15px;
//   margin-bottom: 5px;
//   font-weight: 500;
//   color: ${darkGrey};
//   border-bottom: 10px;
//   min-width: 240px;
// `
//
// export const H3 = styled.div`
//   text-align: left;
//   font-size: 16px;
//   line-height: 28px;
//   margin-top: 10px;
//   margin-bottom: 0px;
//   font-weight: 500;
//   color: ${darkGrey};
//   border-bottom: 0px;
//   min-width: 240px;
// `
