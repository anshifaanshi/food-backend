const { Cart } = require("../models/cartmodels");
const { FoodItem } = require("../models/fooditemsmodels"); 

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { FoodItemId } = req.body;

        // Find the food item by ID
        const food = await FoodItem.findById(FoodItemId);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        // Find or create a cart for the user
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, fooditems: [] }); // Ensure fooditems array is initialized
        }

        // Ensure the cart's fooditems array exists
        cart.fooditems = cart.fooditems || [];

        // Check if the food item already exists in the cart
        const foodItemExists = cart.fooditems.some((item) => 
            item.FoodItemId.equals(FoodItemId)
        );

        if (foodItemExists) {
            return res.status(400).json({ message: "Food item already exists in the cart" });
        }

        // Add the food item to the cart
        cart.fooditems.push({
            FoodItemId,
            price: food.price,
            quantity: 1 // Assuming a default quantity of 1 when adding to the cart
        });

        // Calculate total price (ensure this function exists on your Cart model)
        cart.calculateTotalPrice();
        await cart.save();

        // Return the updated cart
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fooditemId } = req.body;

        // Find the cart by userId
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Filter out the food item to be removed
        cart.FoodItem = cart.FoodItem.filter((item) => 
            item.FoodItemId.toString() !== fooditemId.toString()
        );

        // Recalculate total price if food items are removed
        cart.calculateTotalPrice();

        // Save updated cart
        await cart.save();

        // Send success response
        res.status(200).json({ success: true, message: "Cart item removed", data: cart });
    } catch (error) {
        console.error("Error in removeFromCart:", error); // Log error for debugging
        res.status(500).json({ message: "Internal server error", error: error.message || error });
    }
};



const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId }).populate("FoodItem.FoodItemId");
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json( error);
    }
};

const updateCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { FoodItemId, quantity } = req.body;

        // Find the user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the food item within the cart and update its quantity
        const foodItem = cart.FoodItem.find(item => item.FoodItemId.toString() === FoodItemId);
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found in cart" });
        }

        // Update the quantity
        foodItem.quantity = quantity;

        // Recalculate total price
        cart.calculateTotalPrice();

        // Save the updated cart
        await cart.save();

        // Send a success response
        res.status(200).json({ message: "Cart updated successfully", cart });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


module.exports = { addToCart, removeFromCart, getCart ,updateCart};
