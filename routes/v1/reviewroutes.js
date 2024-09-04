const express = require("express");
const { userauth } = require("../../middlewares/userauth");
const { getAverageRating, addReview, getfoodReviews, deleteReview } = require("../../controllers/reviewcontrollers");

const router = express.Router();

router.get("/avg-rating/:FooditemId", userauth, getAverageRating);
router.get("/course-review/:FooditemId", userauth, getfoodReviews);
router.post("/add-review", userauth, addReview);
router.put("/delete/:reviewId", userauth, deleteReview);

module.exports = { reviewRouter: router };