const express=require("express");
const router=express.Router();
const { getAllFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem, searchFoodItems,getFoodItemsByHotelId } = require('../../controllers/fooditemscontrollers');
const { userauth } = require("../../controllers/usercontrollers");
const{adminauth}=require("../../middlewares/adminauth")
const {upload}=require("../../middlewares/multer.js")


router.get('/allfood', getAllFoodItems);


router.get('/foodbyid:id',upload.single("image"), getFoodItemById);


router.post('/createfood', adminauth,createFoodItem);


router.put('/update:id', upload.single("image"),adminauth,updateFoodItem);


router.delete('/delete:id',adminauth, deleteFoodItem);


router.get('/search', searchFoodItems);
// Route to get food items by hotelId
router.get('/hotel/:hotelId', getFoodItemsByHotelId);


router.put('/:id', async (req, res) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedHotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});











module.exports={fooditemsroutes:router}