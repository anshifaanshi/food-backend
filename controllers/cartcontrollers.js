const { Cart } = require("../models/cartmodels");
const { FoodItem } = require("../models/cartmodels"); 

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { FoodItemId } = req.body;

        const food = await FoodItem.findById(FoodItemId);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, fooditems: [] });
        }

        const foodItemExists = cart.fooditems.some((item) => 
            item.FoodItemId.equals(FoodItemId)
        );

        if (foodItemExists) {
            return res.status(400).json({ message: "Food item already exists in the cart" });
        }

        cart.fooditems.push({
            FoodItemId,
            price: food.price,
            quantity: 1 // Assuming a default quantity of 1 when adding to the cart
        });

        cart.calculateTotalPrice();
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};


const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fooditemId } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.fooditems = cart.fooditems.filter((item) => 
            item.fooditemId.toString() !== fooditemId
        );

        cart.calculateTotalPrice();
        await cart.save();

        res.status(200).json({ success: true, message: "Cart item removed", data: cart });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId }).populate("fooditems.fooditemId");
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports = { addToCart, removeFromCart, getCart };
