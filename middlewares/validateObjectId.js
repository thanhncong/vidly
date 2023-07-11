const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

module.exports = function (req, res, next) {
  if (!isValidObjectId(req.params.id))
    return res.status(400).send("ID parameter does not have right format.");

  return next();
};
