const express=require("express");
const router=express.Router();
const { getAllFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem, searchFoodItems,getFoodItemsByHotelId } = require('../../controllers/fooditemscontrollers');
const { userauth } = require("../../controllers/usercontrollers");
const{adminauth}=require("../../middlewares/adminauth")
const {upload}=require("../../middlewares/multer.js")
const hotel=require("../../models/hotelmodels.js")

router.get('/allfood', getAllFoodItems);


router.get('/foodbyid:id',upload.single("image"), getFoodItemById);


router.post('/createfood', adminauth,createFoodItem);


router.put('/update/:id' ,adminauth,updateFoodItem);


router.delete('/delete:id',adminauth, deleteFoodItem);


router.get('/search', searchFoodItems);
// Route to get food items by hotelId
router.get('/hotel/:hotelId', getFoodItemsByHotelId);



router.put('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const updatedHotel = await hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedHotel) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json(updatedHotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});










module.exports={fooditemsroutes:router}