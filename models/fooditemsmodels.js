const mongoose = require('mongoose');
const { hotel } = require('../models/hotelmodels'); // Destructure to get hotel model

const fooditemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'], // 🛠️ Custom error message
    trim: true // 🛠️ Removes extra spaces from the name
  },
  description: {
    type: String,
    required: [true, 'Description is required'], // 🛠️ Custom error message
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'], // 🛠️ Custom error message
    min: [0, 'Price must be a positive number'] // 🛠️ Optional validation to ensure positive prices
  },
  image: { 
    type: String, 
    required: [true, 'Image URL is required'] // 🛠️ Custom error message
  },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' } ,
  availability: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const FoodItem = mongoose.model('FoodItem', fooditemsSchema);

module.exports = { FoodItem };
