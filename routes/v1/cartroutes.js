const express = require("express");
const { userauth } = require("../../middlewares/userauth");
const { addToCart, removeFromCart, getCart, updateCart } = require("../../controllers/cartcontrollers");

const router = express.Router();

router.post("/add-to-cart", userauth, addToCart);
router.delete("/remove", userauth, removeFromCart);
router.get("/getCart", userauth, getCart);
router.put('/update',updateCart)

module.exports = { cartRouter: router };