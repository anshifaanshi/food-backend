
const { Cart } = require("../models/cartmodels");
const { FoodItem } = require("../models/fooditemsmodels");

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { foodItemId, quantity = 1 } = req.body; // Set default quantity to 1
if(!userId){
    return res.status(400).json({message:"please login"})
}
        // Validate foodItemId
        if (!foodItemId) {
            return res.status(400).json({ message: "Food item ID is required" });
        }

        // Find the food item by its ID
        const food = await FoodItem.findById(foodItemId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        // Find or create the user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, foodItems: [] });
        }

        // Check if the food item is already in the cart
        const foodItemIndex = cart.foodItems.findIndex(item => 
            item.foodItemId.equals(foodItemId)
        );

        if (foodItemIndex >= 0) {
            // If item already exists, send a response that the item is already in the cart
            return res.status(400).json({
                message: "Item already exists in the cart",
                cart: cart // Send the current cart as part of the response
            });
        } else {
            // Add new item with the default quantity
            cart.foodItems.push({
                foodItemId,
                price: food.price,
                quantity
            });
        }

        // Calculate and save total price
        cart.calculateTotalPrice();
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

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


const updateCartItemQuantity = async (req, res) => {
    const userId = req.user.id; // Ensure req.user is set correctly by your auth middleware
    const { foodItemId, quantity } = req.body;

    try {
        // Find the cart by userId
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // Find the item within the cart's foodItems array
        const item = cart.foodItems.find(item => item.foodItemId.equals(foodItemId));
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        // Update the item's quantity
        item.quantity = quantity;

        // Recalculate the total price using calculateTotalPrice
        cart.calculateTotalPrice();

        // Save the updated cart
        await cart.save();

        // Format the response to return relevant data, similar to getCart function
        const formattedCart = {
            _id: cart._id,
            userId: cart.userId,
            foodItems: cart.foodItems.map(item => ({
                foodItemId: item.foodItemId,
                name: item.foodItemId.name, // Ensure this is populated if needed
                price: item.price,
                quantity: item.quantity
            })),
            totalPrice: cart.totalPrice
        };

        // Send success response with updated cart data
        res.status(200).json({ success: true, message: "Quantity updated successfully", cart: formattedCart });
    } catch (error) {
        console.error("Error updating quantity:", error);
        res.status(500).json({ success: false, message: "Failed to update quantity", error: error.message || error });
    }
};



  
  module.exports = { addToCart, removeFromCart, getCart, updateCart, updateCartItemQuantity };
  