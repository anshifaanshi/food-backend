
const express = require("express");
const bodyParser = require("body-parser"); // Middleware to handle raw body data for webhook verification
const { userauth } = require("../../middlewares/userauth");
const stripe = require("stripe")(process.env.Stripe_Private_Api_Key);
const client_domain = process.env.client_domain;

const router = express.Router();

// Create checkout session
router.post("/create-checkout-session", userauth, async (req, res, next) => {
    try {
        const { products } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ error: "No products provided" });
        }

        const lineItems = products.map((product) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: product.name,
                    images: [product.image],
                },
                unit_amount: Math.round(product.price * 100),  // Stripe expects the price in cents
            },
            quantity: product.quantity || 1,
        }));

        // Log client_domain for debugging purposes
        console.log("Client domain:", client_domain);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${client_domain}/user/payment/success`,
            cancel_url: `${client_domain}/user/payment/cancel`,
            metadata: {
                userId: req.user.id  // Assuming `req.user.id` is the authenticated user's ID
            }
        });

        console.log("Checkout session created successfully:", session.id);
        res.json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Failed to create checkout session", details: error.message });
        next(error);  // Pass the error to the error-handling middleware
    }
});

// Webhook to handle Stripe events
router.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.Stripe_Webhook_Secret;

    let event;

    try {
        // Verify the Stripe event
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // Retrieve the user ID from the session metadata
        const userId = session.metadata.userId;

        // Clear the cart for the user in the database
        try {
            await clearUserCart(userId);
            console.log(`Cart cleared for user: ${userId}`);
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    }

    res.json({ received: true });
});

// Helper function to clear the cart
async function clearUserCart(userId) {
    // Logic to clear the cart from the database for the user
    // This depends on your specific database setup
    // For example, if using MongoDB:
    await Cart.deleteMany({ userId: userId });
}

module.exports = { paymentRouter: router };
