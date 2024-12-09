const { FoodItem } = require("../models/fooditemsmodels");
const { hotel } = require('../models/hotelmodels'); // Destructure to get hotel model

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
        const { hotelId, name, description, price, image } = req.body;
        const parsedPrice = Number(price); // Force price to be a number

        console.log('Received data:', req.body); 
        console.log('Type of price:', typeof price, 'Value of price:', price);

        if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({ error: 'Invalid hotel ID.' });
        }

        if (!name || !description || !image) {
            return res.status(400).json({ error: 'Name, description, and image URL are required.' });
        }

        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ 
                error: `Price must be a positive number. Received type: ${typeof price}, value: ${price}` 
            });
        }

        const existingHotel = await hotel.findById(hotelId);
        if (!existingHotel) {
            return res.status(404).json({ error: 'Hotel not found.' });
        }

        const newFoodItem = new FoodItem({
            name,
            description,
            price: parsedPrice, // Use parsed price
            image, 
            hotel: hotelId 
        });

        const savedFoodItem = await newFoodItem.save();
        existingHotel.fooditems.push(savedFoodItem._id);
        await existingHotel.save();

        res.status(201).json({
            message: 'Food item created successfully.',
            foodItem: savedFoodItem,
            hotel: existingHotel
        });
    } catch (error) {
        console.error('Error occurred:', error); 
        res.status(500).json({ error: error.message || 'Server error occurred. Please try again later.' });
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