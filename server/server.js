const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/connectdb")
const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/authRoute")
const chatRoutes = require("./routes/chatRoute");
const goalRoutes = require("./routes/goalRoute");
const moodRoutes = require("./routes/moodRoute");
const feedbackRoutes = require("./routes/feedbackRoute");
const profileRoutes = require("./routes/profileSettingsRoute");


app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/profile", profileRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});



