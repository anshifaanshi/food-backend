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
        const { name, description, price, image, hotelId } = req.body;

        // Check for missing fields
        if (!name || !description || !price || !image || !hotelId) {
            return res.status(400).json({ error: 'All fields are required, including the image URL.' });
        }

        // Validate hotelId
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({ error: 'Invalid hotel ID' });
        }

        // Find the hotel
        const hotelInstance = await Hotel.findById(hotelId);
        if (!hotelInstance) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        // Create new FoodItem
        const foodItem = new FoodItem({
            name,
            description,
            price,
            image,
            hotel: hotelId // ✅ Referencing hotel ID correctly
        });

        // Add the food item to hotel's foodItems array
        hotelInstance.foodItems.push(foodItem._id);
        
        // Save both the food item and the updated hotel
        await foodItem.save();
        await hotelInstance.save();

        res.status(201).json(foodItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


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