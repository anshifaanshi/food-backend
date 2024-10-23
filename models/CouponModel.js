// models/coupon.js
const mongoose = require('mongoose');

// Import the Cart model (ensure this path is correct)
const Cart = require('../models/cartmodels');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId, // Referencing the Cart model
    ref: 'Cart', // Reference to Cart model
    required: false, // Optional: coupons can be used without a specific cart
  },
});

module.exports = mongoose.model('Coupon', couponSchema);
