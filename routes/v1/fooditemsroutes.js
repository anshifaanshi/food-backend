const express=require("express");
const router=express.Router();
const { getAllFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem, searchFoodItems } = require('../../controllers/fooditemscontrollers');
const { userauth } = require("../../controllers/usercontrollers");
const{adminauth}=require("../../middlewares/adminauth")
const {upload}=require("../../middlewares/multer.js")


router.get('/allfood', getAllFoodItems);


router.get('/foodbyid:id',upload.single("image"), getFoodItemById);


router.post('/createfood',upload.single("image"), adminauth,createFoodItem);


router.put('/update:id', upload.single("image"),adminauth,updateFoodItem);


router.delete('/delete:id',adminauth, deleteFoodItem);


router.get('/search', searchFoodItems);













module.exports={fooditemsroutes:router}