const logger = require("../start/logging");

module.exports = function (err, req, res, next) {
  // winston.log()
  logger.error(err.message, {
    metadata: {
      stack: err.stack, // error stack
    },
  });

  // error
  // warn
  // info  // If level is 'info', then error, warn, info will be logged
  // verbose
  // debug
  // silly

  res.status(500).send("Something failed.");
};
