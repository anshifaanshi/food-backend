


const express = require("express");
const {usersignup, userlogin, userlogout, userProfile, userauth, checkuser, userUpdate } = require('../../controllers/usercontrollers');


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
module.exports = { userrouters: router };