const moment = require("moment");
const mongoose = require("mongoose");
const request = require("supertest");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const { Movie } = require("../../models/movie");
let server;

describe("/api/returns", () => {
  beforeAll(() => {
    server = require("../../index");
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await server.close();
  });

  let rental;
  let token;
  let payload;

  const exec = async () => {
    return await request(server)
      .post("/api/returns")
      .send(payload)
      .set("x-auth-token", token);
  };

  beforeEach(async () => {
    token = new User().generateAuthToken();

    const customerId = new mongoose.Types.ObjectId();
    const movieId = new mongoose.Types.ObjectId();
    payload = { customerId, movieId };

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "123",
        phone: "12345",
      },
      movie: {
        _id: movieId,
        title: "title",
        dailyRentalRate: 2,
      },
    });

    await rental.save();
  });

  afterEach(async () => {
    await Rental.deleteMany();
  });

  it("should return 401 if no auth token provided", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if no customerId is provided", async () => {
    delete payload.customerId;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 400 if no movieId is provided", async () => {
    delete payload.movieId;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  // it("should return 400 if customerId is not valid", async () => {
  //   customerId = "a";

  //   const res = await exec();

  //   expect(res.status).toBe(400);
  // });

  // it("should return 400 if no movieId is not valid", async () => {
  //   movieId = "a";

  //   const res = await exec();

  //   expect(res.status).toBe(400);
  // });

  it("should return 404 if no rental of movieId/customerId found", async () => {
    const customerId = new mongoose.Types.ObjectId();
    const movieId = new mongoose.Types.ObjectId();
    payload = { customerId, movieId };

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it("should return 400 if rental already processed", async () => {
    // await Rental.findByIdAndUpdate(rental._id, {
    //   $set: { dateReturned: Date.now() },
    // });
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 on happy path", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should update the dateReturned on happy path", async () => {
    await exec();

    const dateReturned = (await Rental.findById(rental._id)).dateReturned;
    const difference = dateReturned - new Date();
    expect(difference).toBeLessThan(10 * 1000); // 10 seconds
  });

  it("should calculate and set the rental fee", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();

    await exec();

    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(rental.movie.dailyRentalRate * 7);
  });

  it("should increase stock of the movie", async () => {
    const movie = new Movie({
      _id: payload.movieId,
      title: "title",
      dailyRentalRate: 2,
      genre: { name: "genre" },
      numberInStock: 10,
    });
    await movie.save();

    await exec();

    const movieInDb = await Movie.findById(payload.movieId);
    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);

    await Movie.deleteMany();
  });

  it("should return rental object on happy path", async () => {
    const res = await exec();

    expect(res.body).toHaveProperty("customer");
    expect(res.body).toHaveProperty("movie");
    expect(res.body).toHaveProperty("dateOut");
    expect(res.body).toHaveProperty("dateReturned");
    expect(res.body).toHaveProperty("rentalFee");
  });
});

// Define all possible cases when send a post request to /api/returns

// - Return 401 if user is not logged in
// - Return 400 if customerId is not provided
// - Return 400 if movieId is not provided
// - Return 404 if no rental of userId/movieId found
// - Return 400 if rental already processed
// - Happy path:
//  + Return 200
//  + Update the rental dateReturned property
//  + Calculate and set the rentalFee property
//  + Increase movie stock
//  + Return updated rental
