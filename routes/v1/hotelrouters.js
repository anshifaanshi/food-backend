const express=require('express');
const { getallhotels,gethotelbyid, createhotel, updatehotels } = require('../../controllers/hotelcontrollers');
const { Hotel } = require('../../models/hotelmodels');
const router=express.Router();
const {upload}=require("../../middlewares/multer.js")
const {adminauth}=require('../../middlewares/adminauth.js')


router.post('/createhotel',upload.single("image"),adminauth,createhotel)
router.get('/hotels',getallhotels)
router.get('/hotelprofile/:id',gethotelbyid)

router.post('/update/:id',adminauth,updatehotels)


router.put('/:id', async (req, res) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedHotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports={hotelrouters:router}