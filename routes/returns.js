const Joi = require("joi");
const auth = require("../middlewares/auth");
const express = require("express");
const validate = require("../middlewares/validate");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");

const router = express.Router();

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental)
    return res
      .status(404)
      .send("Rental with given customerId and movieId was not found");

  if (rental.dateReturned)
    return res.status(400).send("Rental has already processed");

  await rental.return();

  await Movie.findByIdAndUpdate(req.body.movieId, {
    $inc: { numberInStock: 1 },
  });

  return res.send(rental);
});

function validateReturn(rt) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(rt);
}

module.exports = router;
