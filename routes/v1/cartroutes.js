const express = require("express");
const { userauth } = require("../../middlewares/userauth");
const { addToCart, removeFromCart, getCart, updateCart,clearcart } = require("../../controllers/cartcontrollers");

const router = express.Router();

router.post("/add-to-cart", userauth, addToCart);
router.delete("/remove", userauth, removeFromCart);
router.get("/getCart", userauth, getCart);
router.put('/update', userauth, updateCart); // Added userauth middleware
router.post('/clear-cart',userauth,clearcart)

module.exports = { cartRouter: router };