


const express = require("express");
const {usersignup, userlogin, userlogout, userProfile, userauth, checkuser, userUpdate,UsersCollections ,DeleteUser} = require('../../controllers/usercontrollers');
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
router.get('/users',UsersCollections)
router.get('/users/:id',DeleteUser)


module.exports = { userrouters: router };