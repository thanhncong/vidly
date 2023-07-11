const mongoose = require("mongoose");
const logger = require("../start/logging");
const config = require("config");

module.exports = async function () {
  const db = config.get("db");
  await mongoose.connect(db); // To make sure databased is connected before start app listening
  logger.info(`Connected to ${db}`);
};
