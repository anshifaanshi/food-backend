// controllers/couponController.js
const Coupon = require("../models/CouponModel");
const {Cart} = require("../models/cartmodels");

// Create a new coupon
exports.createCoupon = async (req, res) => {
  const { code, discount, expiryDate } = req.body;

  try {
    const newCoupon = new Coupon({ code, discount, expiryDate });
    await newCoupon.save();
    res.status(201).json({ message: 'Coupon created successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Error creating coupon: ' + err.message });
  }
};

// Validate a coupon
exports.validateCoupon = async (req, res) => {
  const { code } = req.body;

  try {
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    // Check if the coupon is expired or inactive
    if (new Date(coupon.expiryDate) < Date.now() || !coupon.isActive) {
      return res.status(400).json({ error: 'Coupon expired or inactive' });
    }

    // Coupon is valid
    res.status(200).json({ message: 'Coupon is valid', discount: coupon.discount });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Apply coupon in checkout
exports.applyCoupon = async (req, res) => {
  const { couponCode, cartId } = req.body;

  try {
    console.log("Received couponCode:", couponCode);
    console.log("Received cartId:", cartId);

    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    console.log("Found coupon:", coupon);

    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or inactive coupon code' });
    }

    const cart = await Cart.findById(cartId);
    console.log("Found cart:", cart);

    if (!cart) {
      return res.status(400).json({ message: 'Cart not found' });
    }

    cart.calculateTotalPrice(); // Call calculateTotalPrice before using totalPrice
console.log("Cart total price after calculation:", cart.totalPrice);


    const discount = (cart.totalPrice * coupon.discount) / 100;
    console.log("Calculated discount:", discount);

    const finalAmount = cart.totalPrice - discount;
    console.log("Final amount after applying discount:", finalAmount);

    const amountToPay = finalAmount < 0 ? 0 : finalAmount;

    return res.status(200).json({
      message: 'Coupon applied successfully',
      finalAmount: amountToPay,
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return res.status(500).json({
      message: 'Error applying coupon',
      error: error.message || 'An unknown error occurred',
    });
  }
};
