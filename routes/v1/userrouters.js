


const express = require("express");
const {usersignup, userlogin, userlogout, userProfile, userauth, checkuser, userUpdate } = require('../../controllers/usercontrollers');
const {user} =require('../../models/usermodels')

const router = express.Router();

router.get('/', (req, res) => {
    res.send("User accessed");
});

router.post('/login', userlogin);
router.post('/logout', userlogout);
router.post('/signup', usersignup);

// Fix the profile route to correctly handle the :id parameter
router.get('/profile', userauth, userProfile);



router.delete('/delete', (req, res) => {
    res.send("User delete route");
});

router.get('/checkuser', userauth, checkuser);
router.put('/edit',userauth,userUpdate)



router.get('/users', async (req, res) => {
    try {
      const users = await user.find(); // Fetch all users from MongoDB
      res.status(200).json(users); // Send the users as JSON response
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving users', error });
    }
  });
module.exports = { userrouters: router };