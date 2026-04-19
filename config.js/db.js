const mongoose = require('mongoose');

const connectdb = async () => {
    try {
        await mongoose.connect("mongodb://anshifajamsher_db_user:KJlduzMHDY61TeWW@ac-s6ykmyq-shard-00-00.kj9iwlq.mongodb.net:27017,ac-s6ykmyq-shard-00-01.kj9iwlq.mongodb.net:27017,ac-s6ykmyq-shard-00-02.kj9iwlq.mongodb.net:27017/?ssl=true&replicaSet=atlas-u0pwht-shard-0&authSource=admin&appName=Cluster0");
        console.log("Connected to the database");
    } catch (error) {
        console.log("Database connection error:", error);
     
        throw error;
    }
};

module.exports = { connectdb };
