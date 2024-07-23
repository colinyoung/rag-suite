"use strict";

const _ = require("lodash");
require("dotenv").config();

const command = process.argv[2];

const config = _.defaultsDeep(
  require("./config.json"),
  require("./lib/config.default.json")
);

if (command === "load") {
  require("./lib/load.js")(config);
}
