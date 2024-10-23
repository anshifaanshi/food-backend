const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLenght: 8,
        trim: true,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const admin = mongoose.model("admin", adminSchema);

module.exports = { admin };