
const express = require("express");
const { userauth } = require("../../middlewares/userauth");
const stripe = require("stripe")(process.env.Stripe_Private_Api_Key);
const client_domain = process.env.client_domain;

const router = express.Router();

// Create checkout session
router.post("/create-checkout-session", userauth, async (req, res, next) => {
  try {
    const { products, amountInCents } = req.body;

    // Ensure the amount is above the minimum allowed by Stripe (₹50 or 5000 cents)
    const minimumAmountInCents = 5000;
    if (amountInCents < minimumAmountInCents) {
      return res.status(400).json({ error: `The minimum amount for payment is ₹50 (5000 cents)` });
    }

    // Validate if products are provided
    if (!products || products.length === 0) {
      return res.status(400).json({ error: "No products provided" });
    }

    // Process line items
    const lineItems = products.map((product) => {
      if (!product.price || product.price <= 0) {
        product.price = 1; // Set to a minimum valid price if price is invalid
      }

      if (!product.quantity || product.quantity <= 0) {
        product.quantity = 1; // Default to 1 if no valid quantity is provided
      }

      let unitAmount = Math.round(product.price * 100);  // Convert price to cents

      // Ensure minimum charge amount (for example, minimum charge for ₹0.09 is ₹1 or 100 cents)
      if (unitAmount < minimumAmountInCents) {
        unitAmount = minimumAmountInCents;  // Set a minimum charge (5000 cents or ₹50)
      }

      console.log(`Product: ${product.name}, Unit Amount (in cents): ₹${product.price} => ${unitAmount} cents`);

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: unitAmount, // Stripe expects the price in cents
        },
        quantity: product.quantity,
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
        userId: req.user.id,  // Assuming `req.user.id` is the authenticated user's ID
        totalAmount: amountInCents,  // Optional: Store the total amount in metadata
      },
    });

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
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
