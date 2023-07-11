require("express-async-errors");
const winston = require("winston");
const format = winston.format;

// module.exports = function () {
//   winston.add(new winston.transports.File({ filename: "logfile.log" }));
//   winston.add(new winston.transports.Console());

//   winston.exceptions.handle(
//     new winston.transports.Console({ colorize: true, prettyPrint: true }),
//     new winston.transports.File({ filename: "uncaughExceptions.log" })
//   );
// };

// throw new Error("Fail on start");

// const p = Promise.reject(new Error("Something failed miserably"));
// p.then();

const alignedWithColorsAndTime = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

module.exports = winston.createLogger({
  level: "info",
  format: alignedWithColorsAndTime,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logfile.log" }),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "exceptions.log" }),
  ],
});
