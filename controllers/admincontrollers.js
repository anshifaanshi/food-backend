const express = require("express");
const { admin } = require("../models/adminmodels");  // Use named import for admin model
const bcrypt = require("bcrypt");
const { generatetoken } = require("../utils/token");

const adminSignup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }
        const isadminExist = await admin.findOne({ email });

        if (isadminExist) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        const newUser = new admin({ name, email, password: hashedPassword });
        await newUser.save();

        const token = generatetoken(newUser._id, "admin");

        res.cookie("token", token);
        res.json({ success: true, message: "Admin created successfully" });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const adminExist = await admin.findOne({ email });
        if (!adminExist) {
            return res.status(404).json({ success: false, message: "Admin does not exist" });
        }

        const passwordMatch = bcrypt.compareSync(password, adminExist.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "User not authorized" });
        }

        const token = generatetoken(adminExist._id, "admin");
        res.cookie("token", token,{sameSite:"None", secure:true});
       
        res.json({ success: true, message: "Admin login successful" });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

const adminLogout = async (req, res, next) => {
    try {
        res.clearCookie("token");
        
       
        
        res.json({ message: "User logout success", success: true });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};
const adminProfile = async (req, res, next) => {
    try {
        // Use `req.user` set by `adminauth` middleware
        const adminId = req.user.id;
        console.log("Admin ID:", adminId);

        // Fetch admin data using the ID from the verified token
        const adminData = await admin.findOne({ _id: adminId });

        if (!adminData) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.json({ success: true, message: "User data fetched", data: adminData });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};



const checkadmin = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: "Admin not authorized" });
        }
        return res.json({ success: true, message: "Admin authorized" });
    } catch (error) {
        console.log("Error in checkadmin middleware:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

module.exports = { adminLogin, adminLogout, adminProfile, checkadmin, adminSignup };
