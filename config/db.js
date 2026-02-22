const mongoose = require("mongoose");

// Connect to MongoDB using URI from environment variables
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error(`❌ DB Error: ${error.message}`);
    process.exit(1); // Exit process if DB fails
  }
};

module.exports = connectDB;