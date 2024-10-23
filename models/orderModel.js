// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  items: [{ 
    name: String, 
    quantity: Number, 
    price: Number 
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Create Order model
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
