const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fooditems: [{
        fooditemId: {
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
    this.totalprice = this.fooditems.reduce((total, fooditem) => 
        total + (fooditem.price * fooditem.quantity), 0
    );
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = { Cart };
