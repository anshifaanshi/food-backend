const express = require('express');
const { userrouters } = require('./userrouters');  // Importing user routers
const { hotelrouters } = require('./hotelrouters');
const { fooditemsroutes } = require('./fooditemsroutes');
const { adminRouter } = require('./adminroutes');
const { cartRouter } = require('./cartroutes');
const { reviewRouter } = require('../v1/reviewroutes'); // Correct path
const {CouponRoutes}=require('./CouponRoutes')
const v1router = express.Router();

// Add routes to v1 for users, hotels, food items, and admin
v1router.use('/user', userrouters);
v1router.use('/hotel', hotelrouters);
v1router.use('/fooditems', fooditemsroutes);
v1router.use('/admin', adminRouter);
v1router.use('/cart', cartRouter);
v1router.use('/review', reviewRouter);


module.exports = { v1router };
