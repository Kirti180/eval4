const mongooose = require("mongoose");
require("dotenv").config();
const connection = mongooose.connect(process.env.url);
module.exports = { connection };
