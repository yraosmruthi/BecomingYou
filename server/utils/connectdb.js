const mongoose = require("mongoose");
const URI ="mongodb+srv://smruthiyrao17:AMt0ypW4yozQLzAE@cluster0.dnvpdhl.mongodb.net/BecomingYou?retryWrites=true&w=majority&appName=Cluster0";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(URI)
      
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(" MongoDB connection error:", error);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
