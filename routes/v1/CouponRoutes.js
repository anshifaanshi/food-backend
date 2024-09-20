const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/CouponController');
router.post('/create', couponController.createCoupon);

// Get coupon details
router.get('/:code', couponController.getCoupon);

// Use a coupon
router.post('/use/:code', couponController.useCoupon);

module.exports = router;