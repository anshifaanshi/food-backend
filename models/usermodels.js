const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },


    profilepic: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
    },

    hotels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotels",
    }],

    blocked: {
        type: Boolean,
        default: false
    }
});

const user = mongoose.model('user', userschema);
module.exports = { user };