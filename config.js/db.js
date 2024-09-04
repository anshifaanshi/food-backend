const mongoose = require('mongoose');

const connectdb = async () => {
    try {
        await mongoose.connect("mongodb+srv://anshifajamsher:33RgfsM3UPmcwl22@cluster0.pvm3gos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Connected to the database");
    } catch (error) {
        console.log("Database connection error:", error);
        // You can rethrow the error if you want the caller to handle it
        throw error;
    }
};

module.exports = { connectdb };
