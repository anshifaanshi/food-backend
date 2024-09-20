const mongoose = require('mongoose'); 
const { cloudinaryInstane } = require('../config.js/cloudinaryconfig');
const { hotel } = require('../models/hotelmodels');
const { handleimageupload } = require('../utils/imageupload');


const createhotel = async (req, res) => {
    try {
        const userId=req.user;
        const {
            name,
            address: { street, city, state, postalcode, country },
            phone,
            email,
            website,
            rating,
            cuisineType,
            openingHours: { open, close },
            fooditems,
            isActive,
            image
        } = req.body;
        let imageurl

        if (!name || !city || !country || !phone || !email) {
            return res.status(400).json({ message: 'Missing required fields: name, city, country, phone, and email are required.' });
        }

        const ishotelexist = await hotel.findOne({ name });
        if (ishotelexist) {
            return res.status(400).json({ success: false, message: "Hotel already exists" });
        }
        if(req.file){
       imageurl=await handleimageupload(req.file.path)

        }
        const newhotel = new hotel({
            name,
            address: { street, city, state, postalcode, country },
            phone,
            email,
            website,
            rating,
            cuisineType,
            openingHours: { open, close },
            fooditems,
            isActive,
          image: imageurl
        });

        const savedhotels = await newhotel.save();
if(user.role==='admin') newhotel.admin=user.id;


        res.status(201).json(savedhotels);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create hotel", error: error.message });
    }
};

const getallhotels = async (req, res) => {
    try {
        const hotels = await hotel.find();
        if (!hotels || hotels.length === 0) {
            return res.status(200).json({ message: "Empty database" });
        }
        res.status(200).json({data:hotels});
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve all hotels", error: err.message });
    }
};

const gethotelbyid = async (req, res) => {
    try {
        const hotelId = req.params.id; // Store ID in a variable
        // Check if ID is valid before querying the database
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({ message: "Invalid hotel ID format" });
        }
        
        const foundHotel = await hotel.findById(hotelId); // Use correct model name (e.g., Hotel)
        if (!foundHotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        
        res.status(200).json({ data: foundHotel });
    } catch (error) {
        console.error('Error retrieving hotel:', error); // Log error details for debugging
        res.status(500).json({ message: "Failed to retrieve the hotel", error: error.message });
    }
};




const updatehotels=async(req,res,next)=>{
    try {
        const updatedHotel = await hotel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('fooditems');
        if (!updatedHotel) {
            return res.status(404).json({ error: 'Hotel not found' });
        }
      
        
        res.status(200).json(updatedHotel);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
module.exports = {
    createhotel,
    getallhotels,
    gethotelbyid,
    updatehotels
};
