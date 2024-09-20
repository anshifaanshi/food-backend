


const express = require("express");
const {usersignup, userlogin, userlogout, userprofile, userauth, checkuser } = require('../../controllers/usercontrollers');


const router = express.Router();

router.get('/', (req, res) => {
    res.send("User accessed");
});

router.post('/login', userlogin);
router.post('/logout', userlogout);
router.post('/signup', usersignup);

// Fix the profile route to correctly handle the :id parameter
router.get('/profile/:id', userauth, userprofile);

router.put('/update', userauth, (req, res) => {
    res.send("User update route");
});

router.delete('/delete', (req, res) => {
    res.send("User delete route");
});

router.get('/checkuser', userauth, checkuser);

module.exports = { userrouters: router };