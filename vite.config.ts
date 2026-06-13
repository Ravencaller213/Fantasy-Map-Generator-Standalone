export default {
  root: "./src",
  base: process.env.ELECTRON ? "./" : process.env.NETLIFY ? "/" : "/Fantasy-Map-Generator/",
  build: {
    outDir: "../dist",
    assetsDir: "./",
  },
  publicDir: "../public",
};
