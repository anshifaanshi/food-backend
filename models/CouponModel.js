// models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
    required: true, // Percentage or fixed amount
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: 1, // Number of times the coupon can be used
  },
  usedCount: {
    type: Number,
    default: 0, // Number of times the coupon has been used
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
