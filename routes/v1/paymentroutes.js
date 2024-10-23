
const express = require("express");
const { userauth } = require("../../middlewares/userAuth");
const { FoodItem } = require("../../models/fooditemsmodels");
const stripe = require("stripe")(process.env.Stripe_Private_Api_Key);

const client_domain = process.env.CLIENT_DOMAIN;

const router = express.Router();


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
                unit_amount: Math.round(product.price * 100), 
            },
            quantity: product.quantity || 1, 
        }));

        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${client_domain}/user/payment/success`,
            cancel_url: `${client_domain}/user/payment/cancel`,
        });

        res.json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        next(error); 
    }
});


router.get("/session-status", userauth, async (req, res) => {
    try {
        const sessionId = req.query.session_id;

        if (!sessionId) {
            return res.status(400).json({ error: "session_id is required" });
        }

        
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            status: session?.status,
            customer_email: session?.customer_email,
            message: "Successfully fetched session details",
            success: true,
            data: session,
        });
    } catch (error) {
        console.error("Error fetching session status:", error);
        res.status(error?.statusCode || 500).json({ error: error.message || "Internal server error" });
    }
});

module.exports = { paymentRouter: router };
