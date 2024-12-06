
const express = require("express");
const { userauth } = require("../../middlewares/userauth");
const stripe = require("stripe")(process.env.Stripe_Private_Api_Key);
const client_domain = process.env.client_domain;

const router = express.Router();

// Create checkout session

// Create checkout session

router.get("/user/orders", userauth, async (req, res) => {
  try {
    // Fetch orders for the logged-in user
    const userId = req.user.id; // Assuming `req.user` contains the authenticated user's info
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // Sort by most recent orders

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});




router.post("/create-checkout-session", userauth, async (req, res) => {
  try {
    const { products, amountInCents } = req.body;

    // Ensure the amount is above the minimum allowed by Stripe ($0.50 or 50 cents)
    const minimumAmountInCents = 50; // $0.50
    if (amountInCents < minimumAmountInCents) {
      return res.status(400).json({ error: `The minimum amount for payment is $0.50 (50 cents)` });
    }

    // Validate products
    if (!products || products.length === 0) {
      return res.status(400).json({ error: "No products provided" });
    }

    // Process line items
    const lineItems = products.map((product) => {
      const unitAmount = Math.round(product.price * 100); // Convert price to cents
      if (unitAmount <= 0) throw new Error("Product price must be greater than 0");

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
           // Optional: provide a default image
          },
          unit_amount: unitAmount, // Price in USD cents
        },
        quantity: product.quantity || 1, // Default to 1 if no valid quantity is provided
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${client_domain}/user/payment/success`,
      cancel_url: `${client_domain}/user/payment/cancel`,
      metadata: {
        userId: req.user.id, // Assuming `req.user.id` is the authenticated user's ID
        totalAmount: amountInCents / 100, // Store total in USD for reference
      },
    });

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ error: "Failed to create checkout session", details: error.message });
  }
});




module.exports = { paymentRouter: router };


            
       

// Webhook to handle Stripe events (can be implemented if needed)

router.get("/user/payment/success", userauth, async (req, res) => {
    const { status } = req.query;

    // Verify if the payment was successful
    if (status === "success") {
        try {
            // Clear the user's cart here (assuming Cart model is available)
            await Cart.clearCartForUser(req.user.id);

            // Redirect or send a success response
            return res.redirect("/user/dashboard"); // Adjust this URL as needed
        } catch (error) {
            console.error("Error clearing cart:", error);
            return res.status(500).json({ error: "Failed to clear cart after payment" });
        }
    } else {
        return res.status(400).json({ error: "Payment was not successful" });
    }
});

module.exports = { paymentRouter: router };
