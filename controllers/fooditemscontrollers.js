const { FoodItem } = require("../models/fooditemsmodels");
const Hotel=require('../models/hotelmodels')

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
        const { name, description, price,image,hotelId} = req.body;
        if (!name || !description || !price || !image||!hotelId) {
            return res.status(400).json({ error: 'All fields are required, including the image URL.' });
        }


        const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
        const foodItem = new FoodItem({
            name,
            description,
            price,
            image,
            hotel: hotelId // Save image URL directly
        });
        hotel.foodItems.push(foodItem._id)
        await foodItem.save();
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