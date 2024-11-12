
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

    // For example, if using MongoDB:
    router.get("/user/payment/success", userauth, async (req, res) => {
        const { status } = req.query;
    
        // Verify if the payment was successful
        if (status === "success") {
            try {
                // Clear the user's cart here
                // Assuming you have a Cart model or method to clear the cart
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
