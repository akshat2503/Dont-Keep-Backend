const mongoose = require('mongoose')
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/dontkeep"

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to Mongo successfully");
    } catch (error) {
        console.error("Error connecting to Mongo:", error);
    }
};

module.exports = connectToMongo;