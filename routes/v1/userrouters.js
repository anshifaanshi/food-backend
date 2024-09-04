const express=require('express');
const { usersignup, userlogin, userlogout, userprofile,userauth, checkuser } = require('../../controllers/usercontrollers');

const router=express.Router()

router.get('/',(req,res)=>{
    res.send("user accessed ")
})
router.post('/login',userauth,userlogin);

router.post('/logout',userlogout);

 router.post("/signup",usersignup);

 router.get('/profile:id',userauth,userprofile);

 router.put('/update',userauth,);

router.delete('/delete',);

router.get('/checkuser',userauth,checkuser)











module.exports={userrouters:router}