const { user: UserModel } = require('../models/usermodels.js'); // Correct User model import
const bcrypt = require('bcrypt');
const { generatetoken } = require('../utils/token.js'); // Ensure this file exists and works correctly
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

// User Signup Controller
const usersignup = async (req, res, next) => {
    try {
        const { name, email, password, phone, profilepic, hotels } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user already exists
        const isUserExist = await UserModel.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await UserModel.create({
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
            secure: true, // Ensure cookie is sent over HTTPS in production
            sameSite: 'None', // Helps prevent CSRF attacks
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

        const userexist = await UserModel.findOne({ email });
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
        return res.status(200).json({ success: true, message: "User logged in successfully", user: userexist });

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
const userProfile = async (req, res, next) => {
    try {
        const { user } = req;
        console.log(user, "=========user");

        // Use .select() to exclude the password field
        const userData = await UserModel.findOne({ _id: user.id }).select('-password');

        res.json({ success: true, message: "User data fetched", data: userData });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};


// Check User Authorization Middleware
const checkuser = async (req, res, next) => {
    try {
        const { user } = req;
        if (!user) {
            return res.status(401).json({ success: false, message: "User not authorized" });
        }

        // Fetch full user data from the database using the ID
        const fullUserData = await UserModel.findById(user.id).select('name email role'); // Fetch name, email, and role

        if (!fullUserData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, message: "User authorized", data: fullUserData });
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

        // Verify the token and extract user data
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!tokenVerified) {
            return res.status(401).json({ success: false, message: "User not verified" });
        }

        // Attach the user data (ID, role, etc.) to req.user
        req.user = {
            id: tokenVerified.id,  // Ensure your token contains the user ID
            role: tokenVerified.role  // Example: if the token contains user's role
        };

        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const userUpdate = async (req, res, next) => {
    const { email, password, name } = req.body;

    try {
        const updates = {};
        
        if (email && email !== '') {
            updates.email = email;
        }
        if (password && password !== '') {
            updates.password = password; // Make sure to hash the password before saving
        }
        if (name && name !== '') {
            updates.name = name;
        }
        
        const updatedUser = await UserModel.findOneAndUpdate(
            { email }, // Assuming you're finding by email, adjust if needed
            { $set: updates },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json("User not found");
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json("Internal server error");
    }
};



module.exports = { usersignup, userlogin, userlogout, userProfile, userauth, checkuser ,userUpdate};
