const mongoose = require('mongoose'); 
const { cloudinaryInstane } = require('../config.js/cloudinaryconfig');
const  hotel  = require('../models/hotelmodels');
const { handleimageupload } = require('../utils/imageupload');



const createhotel = async (req, res) => {
  try {
    console.log("Create hotel route hit");
    console.log(req.file ,'====== image in controller')
    const userId = req.user; // Assuming userId is obtained from the request

    // Ensure userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }

    // Destructure fields from request body
    const {
      name,
      address,
      phone,
      email,
      website,
      rating,
      cuisineType,
      openingHours,
      fooditems,
      isActive
    } = req.body;
let imageUrl;
    // Validate required fields
    if (!name || !phone || !email) {
      return res.status(400).json({ message: 'Missing required fields: name, phone, and email are required.' });
    }

    let addressData = {};
    if (address) {
      const { street, city, state, postalcode, country } = address;

      if (!city || !country) {
        return res.status(400).json({ message: 'If provided, address must include city and country.' });
      }

      addressData = { street, city, state, postalcode, country };
    }

    const ishotelexist = await hotel.findOne({ name });
    if (ishotelexist) {
      return res.status(400).json({ success: false, message: "Hotel already exists" });
    }
    if(req.file){
const uploadResult=await cloudinaryInstane.uploader.upload(req.file.path)
imageUrl=uploadResult.url;
console.log(uploadResult,'====uploadresult')
    }
   

    const newhotel = new hotel({
      name,
      address: addressData,
      phone,
      email,
      website,
      rating,
      cuisineType,
      openingHours: openingHours ? { open: openingHours.open, close: openingHours.close } : null,
      fooditems,
      isActive,
      image: imageUrl|| null,
      admin: new mongoose.Types.ObjectId(userId) // Correctly instantiate the ObjectId
    });

    await newhotel.save();
    return res.status(201).json({ success: true, message: "Hotel created successfully", hotel: newhotel });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "An error occurred while creating the hotel." });
  }
};

  const getallhotels = async (req, res, next) => {
    try {
        const hotels = await hotel.find()

        res.status(200).json({ success: true, message: "courses fetched", data: hotels });
    } catch (error) {
        next(error);
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

const updatehotels = async (req, res, next) => {
  try {
      // Extract the hotel name from the request body
      const { name } = req.body;
      
      // Check if the hotel name already exists (exclude the current hotel from the check)
      const existingHotel = await hotel.findOne({ name: name, _id: { $ne: req.params.id } });
      
      if (existingHotel) {
          return res.status(400).json({ error: 'Hotel name already exists' });
      }

      // Proceed with updating the hotel if no name conflict is found
      const updatedHotel = await hotel.findByIdAndUpdate(req.params.id, req.body, {
          new: true, // Return the updated document
          runValidators: true, // Ensure schema validations are enforced
      }).populate('fooditems');
      
      if (!updatedHotel) {
          return res.status(404).json({ error: 'Hotel not found' });
      }
      
      res.status(200).json(updatedHotel);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}



const deletehotel=async (req,res)=>{
  try{

    const response= await hotel.findByIdAndDelete(req.body.id)
    if(response){
      res.status(200).json("deleted successfully")
    }
    else{
      res.status(400).json('not found hotel')
    }


  }catch(error){
    res.status(500).json("internal server error")

  }
}
module.exports = {
    createhotel,
    getallhotels,
    gethotelbyid,
    updatehotels,
    deletehotel
};
