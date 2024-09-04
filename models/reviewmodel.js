const mongoose = require("mongoose");

const reviewSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    FooditemId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Fooditem",
        required:true
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5,
    },
    comment:{
        type:String,
        trim:true,
        maxlength:500
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
})
const review=mongoose.model("review",reviewSchema)
module.exports={review}
