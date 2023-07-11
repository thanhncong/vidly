const { User } = require("../../../models/user");
const auth = require("../../../middlewares/auth");
const mongoose = require("mongoose");

describe("auth middleware", () => {
  it("should populate req.user with the payload of a valid token", () => {
    const user = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: true,
    };
    const token = new User(user).generateAuthToken();
    const req = { header: jest.fn().mockReturnValue(token) };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user).toMatchObject(user);
  });
});
