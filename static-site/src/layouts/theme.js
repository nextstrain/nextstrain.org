/* this is available to every styled component via props.theme */
export const theme = {
  /* NEXTSTRAIN COLOURS */
  rainbow10: ["#4042C7", "#4274CE", "#5199B7", "#69B091", "#88BB6C", "#ADBD51", "#CEB541", "#E39B39", "#E56C2F", "#DC2F24"],
  titleColors: ["#4377CD", "#5097BA", "#63AC9A", "#7CB879", "#9ABE5C", "#B9BC4A", "#D4B13F", "#E49938", "#E67030", "#DE3C26"],

  extraLightGrey: "#F1F1F1",
  lightGrey: "#D3D3D3",
  medGrey: "#888",
  darkGrey: "#333",

  accentDark: "#35495E",
  blue: "#5097BA",
  brandColor: "#5097BA",
  sidebarColor: "#F2F2F2",
  errorRed: "rgb(222, 60, 38)",
  goColor: "#89B77F", // green

  /* FONTS / LINE HEIGHTS ETC */
  niceLineHeight: 1.42857143,
  tightLineHeight: 1.2,
  generalFont: "Lato, Helvetica Neue, Helvetica, sans-serif",
  niceFontSize: "16px",
  smallFontSize: "12px",

  sidebarWidth: "260px",

  flexboxgrid: {
    gridSize: 12, // columns
    gutterWidth: 1, // rem
    outerMargin: 0, // rem
    mediaQuery: 'only screen',
    container: {
      sm: 38, // rem
      md: 64, // rem
      lg: 76  // rem
    },
    breakpoints: {
      xs: 0,  // em
      sm: 38, // em
      md: 64, // em
      lg: 76  // em
    }
  }


};

/* FROM AUSPICE */
// export const lighterGrey = "rgb(200, 200, 200)";
// export const darkGrey = "#333";
// export const medGrey = "#888";
// export const lightGrey = "#D3D3D3";
// export const extraLightGrey = "#F1F1F1";
// export const brandColor = "#5097BA"; // #5DA8A3 (green) or #5097BA (blue)
// export const sidebarColor = "#F2F2F2"; // #F4F4F4
