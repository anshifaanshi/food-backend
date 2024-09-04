const { user } = require('../models/usermodels.js');
const bcrypt = require('bcrypt');
const { generatetoken } = require('../utils/token.js');
var jwt=require("jsonwebtoken")
const dotenv=require('dotenv')
dotenv.config()
const jwtauth=require('jsonwebtoken')
const usersignup = async (req, res, next) => {
    try {
        const { name, email, password, phone, profilepic, hotels } = req.body;

        // Check if required fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if the user already exists
        const isUserExist = await user.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        console.log(hashedPassword);

        // Create the new user
        const newUser = await user.create({
            name,
            email,
            password: hashedPassword,
            profilepic,
            hotels
        });
        const token=generatetoken(newUser._id);

        res.cookie('token',token);

        // Send success response
      return  res.status(201).json({ success: true, message: "User created successfully" });
      res.send(newUser);

    } catch (error) {
        console.error(error);
     return   res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
    }
};



const userlogin=async(req,res,next)=>{
    try{
        const {password,email}=req.body
        if(!name||!email ){
            return res.status(400).json({success:false,message:"all fields are required"})
        }
        const userexist=await user.findOne({email})
        if(!userexist){
           return res.status(404).json({success:false,message:"user does not exist"})
        }
 const passwordmatch=bcrypt.compareSync(password,userexist.password)
      if(!passwordmatch){
        return res.status(401).json({message:"user not authorized"})
      }  
      const token=generatetoken(userexist._id);

      res.cookie('token',token);

      // Send success response
    return  res.status(201).json({ success: true, message: "User logged successfully" });
      
    }catch(error){

    }
}



const userlogout=async(req,res,next)=>{
    try{
res.clearCookie('token');
res.json({message:"user  logout successfully",success:true})

    }catch(error){
        console.log(error);
        res.status(error.statusCode||500).json({message:error.message})

    }
}
const userprofile = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(user)
        const userdata = await user.findOne({ _id: id }); // Use the User model to find the user by ID
        if (!userdata) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "User profile retrieved", data: userdata });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};


const checkuser = (req, res, next) => {
    try {
        const { user } = req;
        if (!user) {
            return res.status(401).json({ success: false, message: "user not authorized" });
        }
        res.json({ success: true, message: "user authorized" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "An error occurred", error: err.message });
    }
};


const userauth = (req, res, next) => {
    try {
        console.log(req.cookies);
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ success: false, message: "User not authorized, cookies not found" });
        }

        const tokenVerified = jwtauth.verify(token, process.env.JWT_SECRET_KEY);
        if (!tokenVerified) {
            return res.status(401).json({ success: false, message: "User not verified" });
        }
        req.user = tokenVerified; // Attach the decoded JWT payload to req.user
        next();  // Continue to the next middleware
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




module.exports = { usersignup ,userlogin,userlogout,userprofile,userauth,checkuser};
