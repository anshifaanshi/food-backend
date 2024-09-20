const mongoose = require("mongoose");
const { FoodItem } = require("./fooditemsmodels");

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    FoodItem: [{
        FoodItemId: {
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
    totalprice: {
        type: Number,
        required: true,
        default: 0,
    }
});

cartSchema.methods.calculateTotalPrice = function() {
    this.totalprice = this.FoodItem.reduce((total, foodItem) => 
        total + (foodItem.price * foodItem.quantity), 0
    );
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = { Cart };
