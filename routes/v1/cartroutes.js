const express = require("express");
const { userauth } = require("../../middlewares/userauth");
const { addToCart, removeFromCart, getCart } = require("../../controllers/cartcontrollers");

const router = express.Router();

router.post("/add-to-cart", userauth, addToCart);
router.put("/remove", userauth, removeFromCart);
router.get("/", userauth, getCart);

module.exports = { cartRouter: router };