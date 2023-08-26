#! /usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { StartDevelopmentServer } = require("../dist/develop");
const { RenderApp } = require("../dist/render");

yargs(hideBin(process.argv))
  .command(
    "develop",
    "Start the server to develop your site",
    (yargs) => {},
    (argv) => {
      StartDevelopmentServer();
    }
  )
  .command(
    "render",
    "Render the site to HTML",
    (yargs) => {},
    (argv) => {
      RenderApp();
    }
  )
  .parse();
