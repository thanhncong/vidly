module.exports = function (req, res, next) {
  if (!req.user.isAdmin) return res.status(403).send("Access denied!");
  return next();
};

// 401: Unauthorized: no auth token
// 403: Forbidden: not have appropriate privilege
