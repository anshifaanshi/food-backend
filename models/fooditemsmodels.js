const mongoose = require('mongoose');

const fooditemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category' 
    },
    image: {
        type: String 
        
    },
    availability: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const FoodItem = mongoose.model('FoodItem', fooditemsSchema);

module.exports={ FoodItem }
