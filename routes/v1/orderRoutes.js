// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../../models/orderModel');

// Middleware to simulate user authentication (replace with real auth middleware)

// Route to get orders
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from authenticated request
    const orders = await Order.find({ user: userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});


module.exports = { orderRouter: router };