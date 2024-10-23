// routes/couponRoutes.js
// routes/v1/CouponRoutes.js
const express = require('express');
const router = express.Router();
const {
  createCoupon,
  validateCoupon,
  applyCoupon,
} = require('../../controllers/CouponController');

// Route to create a new coupon (admin only)
router.post('/create', createCoupon);

// Route to validate a coupon
router.post('/validate', validateCoupon);

// Route to apply coupon at checkout
router.post('/checkout', applyCoupon);

module.exports = router; // Export router instead of couponRoutes
