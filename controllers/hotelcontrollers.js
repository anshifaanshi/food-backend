// controllers/hotelcontrollers.js

const { hotel } = require('../models/hotelmodels');


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

        if (!name || !city || !country || !phone || !email) {
            return res.status(400).json({ message: 'Missing required fields: name, city, country, phone, and email are required.' });
        }

        const ishotelexist = await hotel.findOne({ name });
        if (ishotelexist) {
            return res.status(400).json({ success: false, message: "Hotel already exists" });
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
            image
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
        res.status(200).json(hotels);
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve all hotels", error: err.message });
    }
};

const gethotelbyid = async (req, res) => {
    try {
        const hotel = await hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        res.status(200).json(hotel);
    } catch (error) {
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
