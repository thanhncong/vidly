const auth = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const { User, validateUser } = require("../models/user");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  return res.send(user);
});

router.post("/", async (req, res) => {
  const { error, value } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: value.email });

  if (user) return res.status(400).send("User already registered");

  user = new User({ ...value });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(value.password, salt);

  await user.save();

  return res
    .header("x-auth-token", user.generateAuthToken())
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
