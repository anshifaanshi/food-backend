const { user } = require('../models/usermodels.js'); // Correct User import
const bcrypt = require('bcrypt');
const { generatetoken } = require('../utils/token.js'); // Ensure this file exists and works correctly
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
// User Signup Controller
const usersignup = async (req, res, next) => {
    try {
        const { name, email, password, phone, profilepic, hotels } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user already exists
        const isUserExist = await user.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await user.create({
            name,
            email,
            password: hashedPassword,
            profilepic,
            hotels
        });

        // Generate token
        const token = generatetoken(newUser._id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true, // Helps prevent client-side scripts from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Ensure cookie is sent over HTTPS in production
            sameSite: 'Strict', // Helps prevent CSRF attacks
            path: '/' // Ensure path is set correctly
        });

        return res.status(201).json({ success: true, message: "User created successfully", user: newUser });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// User Login Controller
const userlogin = async (req, res, next) => {
    try {
        const { password, email } = req.body;

        if (!password || !email) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const userexist = await user.findOne({ email });
        if (!userexist) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        const passwordmatch = await bcrypt.compare(password, userexist.password);
        if (!passwordmatch) {
            return res.status(401).json({ message: "User not authorized" });
        }

        const token = generatetoken(userexist._id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/'
        });

        return res.status(200).json({ success: true, message: "User logged in successfully" ,userexist});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// User Logout Controller
const userlogout = async (req, res, next) => {
    try {
        // Clear the cookie
        res.clearCookie('token', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.status(200).json({ message: "User logged out successfully", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// User Profile Controller

const userprofile = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Log the received id to check its value
        console.log("Received ID:", id);

        // Validate if the id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }

        // Find user by ID
        const userdata = await user.findById(id);
        if (!userdata) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, message: "User profile retrieved", data:userdata });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};


// Check User Authorization Middleware
const checkuser = (req, res, next) => {
    try {
        const { user } = req;
        if (!user) {
            return res.status(401).json({ success: false, message: "User not authorized" });
        }
        
        // Send user data along with the response
        return res.json({ success: true, message: "User authorized", user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred", error: err.message });
    }
};


// User Authorization Middleware
const userauth = (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ success: false, message: "User not authorized, token missing" });
        }

        // Verify the token
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!tokenVerified) {
            return res.status(401).json({ success: false, message: "User not verified" });
        }

        // Attach user to request object
        req.user = tokenVerified;
        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { usersignup, userlogin, userlogout, userprofile, userauth, checkuser };