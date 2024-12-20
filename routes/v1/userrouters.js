


const express = require("express");
const {usersignup, userlogin, userlogout, userProfile, userauth, checkuser, userUpdate,UsersCollections ,DeleteUser,BlockUser, UnblockUser} = require('../../controllers/usercontrollers');
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




router.get('/checkuser', userauth, checkuser);
router.put('/edit',userauth,userUpdate)
router.get('/users',UsersCollections)
router.delete('/delete/:id',DeleteUser)
router.post('/block/:id',BlockUser)
router.post('/unblock/:id',UnblockUser)
module.exports = { userrouters: router };