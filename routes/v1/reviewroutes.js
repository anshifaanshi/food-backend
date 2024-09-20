const express = require("express");
const { userauth}  = require("../../controllers/usercontrollers");
const { getAverageRating, addReview, getfoodReviews, deleteReview } = require("../../controllers/reviewcontrollers");

const router = express.Router();

router.get("/avg-rating/:FooditemId",userauth,getAverageRating);
router.get("/food-reviews/:FooditemId",userauth, getfoodReviews); // Updated the endpoint
router.post("/add-review",userauth, addReview);
router.delete("/delete/:reviewId",userauth, deleteReview); // Use DELETE instead of PUT for deleting

module.exports = { reviewRouter: router };
