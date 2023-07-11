const mongoose = require("mongoose");
const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
let server;

describe("/api/genres", () => {
  beforeAll(() => {
    server = require("../../index");
  });

  afterAll(() => {
    mongoose.connection.close();
    server.close();
  });

  afterEach(async () => {
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.insertMany([{ name: "genre1" }, { name: "genre2" }]);

      const res = await request(server).get("/api/genres");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a genre if valid id is passed", async () => {
      const genre = new Genre({ name: "genre" });
      await genre.save();

      const res = await request(server).get("/api/genres/" + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: "genre", _id: genre.id });
    });

    it("should return 400 if invalid format id is passed", async () => {
      const res = await request(server).get("/api/genres/" + "1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if passed id has valid format but not found", async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(server).get("/api/genres/" + id);

      expect(res.status).toBe(404);
    });
  });

  describe("POST", () => {
    // Define the happy path, and then in each test, we change one parameter that clearly aligns with the name of the test

    let token;
    let name;

    const exec = async () => {
      return await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 3 characters", async () => {
      name = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = "a".repeat(51);

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      const res = await exec();

      expect(await Genre.count()).toBe(1);
      expect(await Genre.find({ name })).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("PUT /:id", () => {
    let id;
    let token;
    let name;

    const exec = () => {
      return request(server)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(async () => {
      // populate genre db with a genre
      const genre = new Genre({ name: "genre" });
      await genre.save();

      id = genre._id;
      token = new User().generateAuthToken();
      name = "new_genre";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if invalid format id is passed", async () => {
      id = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is less than 3 characters", async () => {
      name = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = "a".repeat(51);

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if all inputs are valid, but genre with given id was not found", async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should update the genre if everything is ok", async () => {
      await exec();

      expect((await Genre.findById(id)).name).toBe(name);
    });

    it("should return the updated genre if everything is ok", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("DELETE /:id", () => {
    let id;
    let token;

    const exec = () => {
      return request(server)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      // populate genre db with a genre
      const genre = new Genre({ name: "genre" });
      await genre.save();

      id = genre._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if client is not admin", async () => {
      token = new User().generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 400 if user is admin, but invalid genre id", async () => {
      id = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if user is admin, valid genre id, but genre not found", async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete genre in db if everything is ok", async () => {
      await exec();

      expect(await Genre.count()).toBe(0);
    });

    it("should return deleted genre", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre");
    });
  });
});
