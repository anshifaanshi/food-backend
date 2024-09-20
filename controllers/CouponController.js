// controllers/couponController.js
const Coupon = require('../models/CouponModel');

exports.createCoupon = async (req, res) => {
  try {
    const { code, discount, expiryDate, usageLimit } = req.body;

    // Validate input
    if (!code || !discount || !expiryDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create coupon
    const coupon = new Coupon({
      code,
      discount,
      expiryDate,
      usageLimit,
    });

    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    // Find coupon
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if the coupon is expired or usage limit is exceeded
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });
    }

    res.status(200).json({ coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.useCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    // Find coupon
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if the coupon is expired or usage limit is exceeded
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });
    }

    // Update coupon usage
    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).json({ message: 'Coupon used successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
