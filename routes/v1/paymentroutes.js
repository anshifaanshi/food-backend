
const express = require("express");
const { userauth } = require("../../middlewares/userauth");
const stripe = require("stripe")(process.env.Stripe_Private_Api_Key);
const client_domain = process.env.client_domain;

const router = express.Router();

// Create checkout session
router.post("/create-checkout-session", userauth, async (req, res, next) => {
    try {
        const { products } = req.body;

        // Validate if products are provided
        if (!products || products.length === 0) {
            return res.status(400).json({ error: "No products provided" });
        }

        // Process line items, allowing smaller amounts by rounding up
        const lineItems = products.map((product) => {
            if (!product.price || product.price <= 0) {
                product.price = 1; // Set to a minimum valid price if price is invalid
            }

            if (!product.quantity || product.quantity <= 0) {
                product.quantity = 1; // Default to 1 if no valid quantity is provided
            }

            let unitAmount = Math.round(product.price * 100);  // Convert price to cents

            // Ensure minimum charge amount (for example, minimum charge for ₹0.09 is ₹1 or 100 cents)
            if (unitAmount < 100) {
                unitAmount = 100;  // Set a minimum charge (100 cents or ₹1)
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

        // Log line items for debugging
        console.log("Line Items:", JSON.stringify(lineItems, null, 2));

        // Create Stripe checkout session
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
