const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createMoodEntry,
  getMoodEntries,
  getMoodTrend,
  getAverageMood,
  getMoodDistribution,
  updateMoodEntry,
  deleteMoodEntry,
  getTodaysMood,
} = require("../Controllers/moodController");


const router = express.Router();

// Middleware to authenticate user (assumes you have auth middleware)
const verifyFirebaseToken = require("../middlewares/firebase-auth"); // Adjust path as needed

// Validation middleware
const validateMoodEntry = [
  body("mood")
    .isInt({ min: 1, max: 5 })
    .withMessage("Mood must be an integer between 1 and 5"),
  body("note")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Note must be a string with maximum 1000 characters"),
];

const validateMoodUpdate = [
  param("id").isMongoId().withMessage("Invalid mood entry ID"),
  body("mood")
    .isInt({ min: 1, max: 5 })
    .withMessage("Mood must be an integer between 1 and 5"),
  body("note")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Note must be a string with maximum 1000 characters"),
];

const validateMoodId = [
  param("id").isMongoId().withMessage("Invalid mood entry ID"),
];

const validateQueryParams = [
  query("days")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Days must be an integer between 1 and 365"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100"),
];

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken);

// POST /api/mood - Create a new mood entry
router.post("/", validateMoodEntry, createMoodEntry);

// GET /api/mood - Get mood entries for authenticated user
router.get("/", validateQueryParams, getMoodEntries);

// GET /api/mood/today - Get today's mood entry
router.get("/today", getTodaysMood);

// GET /api/mood/trend - Get mood trend
router.get("/trend", validateQueryParams, getMoodTrend);

// GET /api/mood/average - Get average mood
router.get("/average", validateQueryParams, getAverageMood);

// GET /api/mood/distribution - Get mood distribution
router.get("/distribution", validateQueryParams, getMoodDistribution);

// PUT /api/mood/:id - Update a mood entry
router.put("/:id", validateMoodUpdate, updateMoodEntry);

// DELETE /api/mood/:id - Delete a mood entry
router.delete("/:id", validateMoodId, deleteMoodEntry);

module.exports = router;
