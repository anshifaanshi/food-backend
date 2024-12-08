const { FoodItem } = require("../models/fooditemsmodels");
const hotel=require('../models/hotelmodels')
const mongoose = require('mongoose');
const getAllFoodItems = async (req, res) => {
    try {
        const foodItems = await FoodItem.find();
        res.status(200).json(foodItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getFoodItemById = async (req, res) => {
    try {
        const foodItem = await FoodItem.findById(req.params.id);
        if (!foodItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.status(200).json(foodItem);
    } catch (err) { 
        console.log(err)
        res.status(500).json({ error: err.message }); // Improved error handling
    }
};

const getFoodItemsByHotelId = async (req, res) => {
    try {
        const { hotelId } = req.params; // Get hotelId from params
        const foodItems = await FoodItem.find({ hotel: hotelId }); // Filter food items by hotelId
        if (!foodItems || foodItems.length === 0) {
            return res.status(404).json({ error: 'No food items found for this hotel' });
        }
        res.status(200).json(foodItems);
    } catch (err) {
        console.error('Error fetching food items:', err);
        res.status(500).json({ error: err.message });
    }
};


const createFoodItem = async (req, res) => {
    try {
        // Step 1: Validate the hotelId
        const { hotelId, name, description, price } = req.body;

        if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({ error: 'Invalid hotel ID.' });
        }

        if (!name || !description || !price) {
            return res.status(400).json({ error: 'Name, description, and price are required.' });
        }

        // Step 2: Check if the hotel exists
        const existingHotel = await hotel.findById(hotelId);
        if (!existingHotel) {
            return res.status(404).json({ error: 'Hotel not found.' });
        }

        // Step 3: Create a new FoodItem and associate it with the hotel
        const newFoodItem = new FoodItem({
            name,
            description,
            price,
            hotel: hotelId // Link to the hotel by its ID
        });

        // Step 4: Save the new food item to the database
        const savedFoodItem = await newFoodItem.save();

        // Step 5: Update the hotel by adding the new food item to its fooditems array
        existingHotel.fooditems.push(savedFoodItem._id);
        await existingHotel.save();

        res.status(201).json({
            message: 'Food item created and associated with hotel successfully.',
            foodItem: savedFoodItem,
            hotel: existingHotel
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error occurred. Please try again later.' });
    }
};



const updateFoodItem = async (req, res) => {
    try {
        const foodItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!foodItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.status(200).json(foodItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const deleteFoodItem = async (req, res) => {
    try {
        const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
        if (!foodItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.status(200).json({ message: 'Food item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const searchFoodItems = async (req, res) => {
    try {
        const { query } = req.query;
        const foodItems = await FoodItem.find({ name: new RegExp(query, 'i') });
        res.status(200).json(foodItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem, searchFoodItems,getFoodItemsByHotelId };