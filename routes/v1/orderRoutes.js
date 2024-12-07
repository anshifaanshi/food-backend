// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../../models/orderModel')
const { userauth } = require('../../middlewares/userauth');

// 📄 Route to get all orders for the logged-in user
router.get('/my-orders', userauth, async (req, res) => {
  try {
    const userId = req.user.id; // User ID from the authenticated user (JWT)
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // Get orders sorted by newest first

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});

module.exports = router;
