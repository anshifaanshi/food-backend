const { Cart } = require("../models/cartmodels");
const { FoodItem } = require("../models/fooditemsmodels");

const addToCart = async (req, res) => {
    try {
        // Ensure that the user is authenticated and has a valid user ID
        const userId = req.user.id;
        const { foodItemId } = req.body;

        // Check if foodItemId is provided in the request body
        if (!foodItemId) {
            return res.status(400).json({ message: "Food item ID is required" });
        }

        // Find the food item by its ID
        const food = await FoodItem.findById(foodItemId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        // Find the cart for the user, or create a new one if it doesn't exist
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, foodItems: [] }); // Initialize a new cart
        }

        // Ensure the cart's foodItems array is initialized
        cart.foodItems = cart.foodItems || [];

        // Check if the food item already exists in the cart
        const foodItemExists = cart.foodItems.some(item => 
            item.foodItemId.equals(foodItemId)
        );

        if (foodItemExists) {
            return res.status(400).json({ message: "Food item already exists in the cart" });
        }

        // Add the food item to the cart
        cart.foodItems.push({
            foodItemId,
            price: food.price,
            quantity: 1 // Add default quantity of 1
        });

        // Calculate total price using the custom method (make sure this method exists)
        cart.calculateTotalPrice();

        // Save the cart
        await cart.save();

        // Return the updated cart
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const mongoose = require('mongoose'); // Import mongoose to access ObjectId


const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { foodItemId } = req.body;

        // Find the cart by userId
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Debugging: Log cart items before removal
        console.log('Before removal, cart items:', cart.foodItems);

        // Filter out the food item to be removed
        cart.foodItems = cart.foodItems.filter(item => 
            item.foodItemId.equals(foodItemId) // Proper ObjectId comparison
        );

        // Debugging: Log cart items after removal
        console.log('After removal, cart items:', cart.foodItems);

        // Recalculate total price if food items are removed
        cart.calculateTotalPrice();

        // Save updated cart
        await cart.save();

        // Send success response
        res.status(200).json({ success: true, message: "Cart item removed", cart });
    } catch (error) {
        console.error("Error in removeFromCart:", error);
        res.status(500).json({ message: "Internal server error", error: error.message || error });
    }
};




const getCart = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set correctly by your auth middleware

        const cart = await Cart.findOne({ userId }).populate("foodItems.foodItemId"); // Correct population path
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Format the response to return relevant data, including the cart ID
        const formattedCart = {
            _id: cart._id, // Include the cart ID
            userId: cart.userId,
            foodItems: cart.foodItems.map(item => ({
                foodItemId: item.foodItemId._id, // Ensure this matches your FoodItem schema
                name: item.foodItemId.name,       // Accessing the name
                price: item.price,                 // Use price from cart
                quantity: item.quantity             // Accessing quantity in the cart
            })),
            totalPrice: cart.totalPrice || 0 // Safeguard for total price
        };

        res.status(200).json(formattedCart);
    } catch (error) {
        console.error("Error retrieving cart:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};



const updateCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { foodItemId, quantity } = req.body;

        // Find the user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the food item within the cart and update its quantity
        const foodItem = cart.foodItems.find(item => item.foodItemId.equals(foodItemId));
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

module.exports = { addToCart, removeFromCart, getCart, updateCart };