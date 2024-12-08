const mongoose = require('mongoose');

const fooditemsSchema = new mongoose.Schema({
  name: {
    type: String,
    
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    
  },
  image: { type: String, required: true },
  availability: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const FoodItem = mongoose.model('FoodItem', fooditemsSchema);

module.exports = { FoodItem };