const { user: UserModel } = require('../models/usermodels.js'); 
const bcrypt = require('bcrypt');
const { generatetoken } = require('../utils/token.js');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();


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
             // Ensure path is set correctly
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

        // Set cookie correctly
        res.cookie("token", token, {
            sameSite: "None", // Required for cross-site cookies in production
            secure: true,     // Ensure secure transmission over HTTPS
            httpOnly: true,   // Helps prevent JavaScript access on the client
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
            secure: true,
            sameSite: 'None'
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
        
        // If the token verification fails, an error will be thrown, so we don't need to check for null
        req.user = {
            id: tokenVerified.id,  // Ensure your token contains the user ID
            role: tokenVerified.role  // Example: if the token contains user's role
        };

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, message: "User not verified" });
    }
};


   

const userUpdate = async (req, res, next) => {
    const { email, password, name } = req.body;

    try {
        // Check if the new email already exists in the database
        if (email) {
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email ID already exists" });
            }
        }

        const updates = {};

        if (email && email !== '') {
            updates.email = email;
        }
        if (password && password !== '') {
            updates.password = password; // Ensure to hash the password before saving
        }
        if (name && name !== '') {
            updates.name = name;
        }

        // Assuming you're finding the user by their current email or another unique identifier
        const updatedUser = await UserModel.findOneAndUpdate(
            { email }, // You may want to adjust this if you're updating based on a different field (e.g., user ID)
            { $set: updates },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




module.exports = { usersignup, userlogin, userlogout, userProfile, userauth, checkuser ,userUpdate};
