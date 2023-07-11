const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const { User } = require("../models/user");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: value.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(value.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  return res.send(user.generateAuthToken());
});

function validate(loginData) {
  const schema = Joi.object({
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(loginData);
}

module.exports = router;

// No need to execute log out route, since auth token is stored on client
// Should avoid storing auth token on the server, if need to do so, need to hash it first, just like the passwords
// Using https to send auth token between client and server
