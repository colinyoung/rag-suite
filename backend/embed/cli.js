"use strict";

require("dotenv").config();

const config = require("./config.json");

const command = process.argv[2];

if (command === "load") {
  require("./lib/load.js")(config.load);
}
