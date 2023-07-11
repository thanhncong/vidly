const auth = require("../middlewares/auth");
const express = require("express");
const { Movie, validateMovie } = require("../models/movie");
const { Genre } = require("../models/genre");

const router = express.Router();

router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("name");
  return res.send(movies);
});

router.post("/", auth, async (req, res) => {
  const { error, value } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre;
  try {
    genre = await Genre.findById(value.genreId);
    if (!genre) throw new Error("Genre with given id was not found");
  } catch (error) {
    console.log(error.message);
    return res.status(404).send("Genre with given id was not found");
  }

  let movie = new Movie({
    ...value,
    genre: { _id: genre._id, name: genre.name }, // Just interesting in these 2 properties of genre
  });
  movie = await movie.save();

  return res.send(movie);
});

router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) throw new Error("Movie with given id was not found");
    return res.send(movie);
  } catch (error) {
    console.log(error.message);
    return res.status(404).send("Movie with given id was not found");
  }
});

router.put("/:id", auth, async (req, res) => {
  const { error, value } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre;
  try {
    genre = await Genre.findById(value.genreId);
    if (!genre) throw new Error("Genre with given id was not found");
  } catch (error) {
    console.log(error.message);
    return res.status(404).send("Genre with given id was not found");
  }

  let movie;
  try {
    movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        ...value,
        genre: { _id: genre._id, name: genre.name },
      },
      { new: true }
    );
    if (!movie) throw new Error("Movie with given id was not found");
  } catch (error) {
    console.log(error.message);
    return res.status(404).send("Movie with given id was not found");
  }

  return res.send(movie);
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) throw new Error("Movie with given id was not found");
    res.send(movie);
  } catch (error) {
    console.log(error.message);
    res.status(404).send("Movie with given id was not found");
  }
});

module.exports = router;
