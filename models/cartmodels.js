const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    foodItems: [{ // Changed to lowercase 'foodItems'
        foodItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FoodItem",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
    }],
    totalPrice: { // Changed to lowercase 'totalPrice'
        type: Number,
        required: true,
        default: 0,
    }
});

// Method to calculate total price
cartSchema.methods.calculateTotalPrice = function() {
    this.totalPrice = this.foodItems.reduce((total, foodItem) => 
        total + (foodItem.price * foodItem.quantity), 0
    );
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = { Cart };
