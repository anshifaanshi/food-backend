const express = require("express");
const {admin}=require("../models/adminmodels")

const bcrypt = require("bcrypt");
const { generatetoken } = require("../utils/token");

const adminSignup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "all fields required" });
        }
        const isadminExist = await admin.findOne({ email });

        if (isadminExist) {
            return res.status(400).json({ message: "mentor already exist" });
        }

        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        const newUser = new admin({ name, email, password: hashedPassword });
        await newUser.save();

        const token = generatetoken(newUser._id, "mentor");

        res.cookie("token", token);
        res.json({ success: true, message: "admin created successfully" });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};




const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "all fields are required" });
        }

        const adminExist = await admin.findOne({ email });
        if (!adminExist) {
            return res.status(404).json({ success: false, message: "admin does not exist" });
        }

        const passwordMatch = bcrypt.compareSync(password, adminExist.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "user not autherized" });
        }

        const token = generatetoken(adminExist._id, "admin");

        res.cookie("token", token);
        res.json({ success: true, message: "admin login successfull" });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

 adminLogout = async (req, res, next) => {
    try {
        res.clearCookie("token");
        res.json({ message: "user logout success", success: true });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

 const adminProfile = async (req, res, next) => {
    try {
        const admin = req.user;
        
        const mentorData = await admin.findOne({ _id: mentor.id });

        res.json({ success: true, message: "admin data fetched", data: mentorData });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
}
 const checkadmin = async (req, res, next) => {
    try {
        const { admin } = req;
        if (!admin) {
            res.status(401).json({ success: false, message: "admin not autherized" });
        }

        res.json({ success: true, message: "admin autherized" });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

module.exports = {  adminLogin , adminLogout, adminProfile,checkadmin,adminSignup}
