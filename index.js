const express = require("express");
const app = express();
const logger = require("./start/logging"); // Logging module first, in case getting errors when loading other modules later

require("./start/db")();
require("./start/config")();
require("./start/routes")(app);
require("./start/validation")();
require("./start/prod")(app);

const port = process.env.PORT || 3000;
module.exports = app.listen(port, () => {
  logger.info(`Listening on port ${port}...`);
});
