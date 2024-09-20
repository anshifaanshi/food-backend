const { Fooditem } = require("../models/fooditemsmodels");
const { review } = require("../models/reviewmodel"); // Adjusted review model import

const addReview = async (req, res) => {
  try {
    const { FooditemId, rating, comment } = req.body;
    const userId = req.user.id;

    const fooditem = await Fooditem.findById(FooditemId);
    if (!fooditem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const reviewData = await review.findOneAndUpdate(
      { userId, FooditemId },
      { rating, comment },
      { new: true, upsert: true }
    );

    res.status(201).json(reviewData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getfoodReviews = async (req, res) => {
  try {
    const { FooditemId } = req.params;
    const reviews = await review.find({ FooditemId }).populate("FooditemId", "name").sort({ createdAt: -1 });
    
    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found for this food item" });
    }
    
    res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const deletedReview = await review.findOneAndDelete({ _id: reviewId });

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getAverageRating = async (req, res) => {
  try {
    const { FooditemId } = req.params;
    const reviews = await review.find({ FooditemId }); // Filter reviews by FooditemId

    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found for the food item" });
    }

    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    res.status(200).json({ average });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = { getAverageRating, deleteReview, addReview, getfoodReviews };
