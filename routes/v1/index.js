// routes/v1/index.js
const express = require('express');
const { userrouters } = require('./userrouters');
const { hotelrouters } = require('./hotelrouters');
const { fooditemsroutes } = require('./fooditemsroutes');
const { adminRouter } = require('./adminroutes');
const { cartRouter } = require('./cartroutes');
const { reviewRouter } = require('../v1/reviewroutes');
const { paymentRouter } = require('./paymentroutes');
const couponRoutes = require('./CouponRoutes'); // Import router correctly

const v1router = express.Router();

// Add routes to v1 for users, hotels, food items, and admin
v1router.use('/user', userrouters);
v1router.use('/hotel', hotelrouters);
v1router.use('/fooditems', fooditemsroutes);
v1router.use('/admin', adminRouter);
v1router.use('/cart', cartRouter);
v1router.use('/review', reviewRouter);
v1router.use('/payment', paymentRouter);
v1router.use('/coupons', couponRoutes); // Attach the coupon routes

module.exports = { v1router };
