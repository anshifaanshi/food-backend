const { Fooditem } = require("../models/fooditemsmodels");
const { review} = require("../models/reviewmodel");

const addReview = async (req, res) => {
    try {
      const { FooditemId, rating, comment } = req.body;
      const userId = req.user.id;
  
      
      const fooditem = await Fooditem.findById(FooditemId);
      if (!fooditem) {
        return res.status(404).json({ message: "Food item not found" });
      }
  
      
      const review = await Review.findOneAndUpdate(
        { userId, FooditemId },
        { rating, comment },
        { new: true, upsert: true }
      );
  
      res.status(201).json(review);
    } catch (error) {
      console.error(error);  
      res.status(500).json({ message: "Internal server error", error });
    }
  };
  
const getfoodReviews=async(req,res)=>{
    try{
        const {FooditemId}=req.params;
        const reviews=await review.find({FooditemId}).populate("FooditemId","name").sort({createdAt:-1})
        if(!review.length){
            return res.status(404).json({message:"no reviews found for this cfood items"})
        }
        req.status(200).json(reviews)
    }catch(error){
        return res.status(500).json({message:"inernal server error",error})
    }
}

const deleteReview=async(req,res)=>{
    try{
        const {reviewId}=req.params;
        const review =await review.findOneAndDelete({_id:reviewId,})
        if(!review){
            return res.status(404).json({message:"review not found"})
        }
        res.status(200).json({message:"review deleted successfully"})
    }catch(error){
        res.status(500).json({message:"internal server error",error})
    }
    
}
const getAverageRating=async(req,res)=>{
    try{
        const {FooditemId}=req.params;
        const reviews= await review.find();
        if(!reviews.length){
            return res.status(404).json({message:"no reviews found for the foood item"})

        }
        const average=reviews.reduce((sum,reviews)=>sum+reviews.rating,0)/reviews.length;
        res.staus(200).json({average})
    }catch(error){
        res.status(500).json({message:"inernal server error",error})
    }
}

module.exports = { getAverageRating, deleteReview, addReview, getfoodReviews };