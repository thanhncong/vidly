const auth = require("../middlewares/auth");
const express = require("express");
const { Customer, validate } = require("../models/customer");

const router = express.Router();

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.send(customers);
});

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) throw new Error("Customer with given id is not found");
    res.send(customer);
  } catch (error) {
    console.log(error.message);
    res.status(404).send("Customer with given id is not found");
  }
});

router.post("/", auth, async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = new Customer({ ...value });
  customer = await customer.save();

  res.send(customer);
});

router.put("/:id", auth, async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...value },
      { new: true }
    );
    if (!customer) throw new Error("Customer with given id is not found");
    res.send(customer);
  } catch (error) {
    console.log(error.message);
    res.status(404).send("Customer with given id is not found");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) throw new Error("Customer with given id is not found");
    res.send(customer);
  } catch (error) {
    console.log(error.message);
    res.status(404).send("Customer with given id is not found");
  }
});

module.exports = router;
