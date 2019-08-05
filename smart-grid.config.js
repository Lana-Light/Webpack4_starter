const smartgrid = require("smart-grid");

let settings = {
  outputStyle: "scss",
  columns: 24,
  offset: "10px",
  //mobileFirst: true,
  container: {
    maxWidth: "950px",
    fields: "30px"
  },
  breakPoints: {
    md: {
      width: "920px",
      fields: "15px"
    },
    sm: {
      width: "720px"
    },
    xs: {
      width: "576px"
    },
    xxs: {
      width: "420px"
    }
  }
};

smartgrid("./src/scss", settings);
