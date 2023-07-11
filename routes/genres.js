const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const express = require("express");
const { Genre, validateGenre } = require("../models/genre");
const admin = require("../middlewares/admin");
const validate = require("../middlewares/validate");
const router = express.Router();

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.send(genres);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send("Genre with given id was not found.");

  return res.send(genre);
});

router.post("/", [auth, validate(validateGenre)], async (req, res) => {
  const genre = new Genre({ ...req.body });
  await genre.save();

  return res.send(genre);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validateGenre)],
  async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!genre)
      return res.status(404).send("Genre with given id was not found");

    return res.send(genre);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send("Genre with given id was not found");

  return res.send(genre);
});

module.exports = router;
