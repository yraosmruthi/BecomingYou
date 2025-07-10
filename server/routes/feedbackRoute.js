const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getFeedback,
  getUserFeedback,
  getFeedbackAnalytics,
  updateFeedback,
} = require("../Controllers/feedBackController");

// Middleware for authentication (assuming you have one)
const verifyFirebaseToken  = require("../middlewares/firebase-auth");

// Middleware for input validation
const { body, param, query, validationResult } = require("express-validator");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

router.post(
  "/submit",
  verifyFirebaseToken,
  [
    body("sessionId").notEmpty().withMessage("Session ID is required"),
    body("userId").notEmpty().withMessage("User ID is required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be an integer between 1 and 5"),
    body("comment")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Comment must not exceed 1000 characters"),
    body("moodAfterChat")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Mood must not exceed 100 characters"),
  ],
  handleValidationErrors,
  submitFeedback
);

// Get feedback for a specific session
router.get(
  "/session/:sessionId",
  verifyFirebaseToken,
  [
    param("sessionId").isMongoId().withMessage("Invalid session ID format"),
    query("userId").notEmpty().withMessage("User ID is required"),
  ],
  handleValidationErrors,
  getFeedback
);

// Get all feedback for a user with pagination
router.get(
  "/user/:userId",
  verifyFirebaseToken,
  [
    param("userId").notEmpty().withMessage("User ID is required"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  handleValidationErrors,
  getUserFeedback
);

// Get feedback analytics for a user
router.get(
  "/analytics/:userId",
  verifyFirebaseToken,
  [
    param("userId").notEmpty().withMessage("User ID is required"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),
  ],
  handleValidationErrors,
  getFeedbackAnalytics
);

// Update feedback (within 24 hours)
router.put(
  "/:feedbackId",
  verifyFirebaseToken,
  [
    param("feedbackId").isMongoId().withMessage("Invalid feedback ID format"),
    body("userId").notEmpty().withMessage("User ID is required"),
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be an integer between 1 and 5"),
    body("comment")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Comment must not exceed 1000 characters"),
    body("moodAfterChat")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Mood must not exceed 100 characters"),
  ],
  handleValidationErrors,
  updateFeedback
);

// Get feedback statistics (for admin/analytics)
router.get(
  "/stats",
  verifyFirebaseToken, // You might want admin-only middleware here
  async (req, res) => {
    try {
      const stats = await Feedback.aggregate([
        {
          $group: {
            _id: null,
            totalFeedback: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            ratingDistribution: {
              $push: "$rating",
            },
          },
        },
      ]);

      if (stats.length === 0) {
        return res.json({
          success: true,
          data: {
            totalFeedback: 0,
            averageRating: 0,
            ratingDistribution: {},
          },
        });
      }

      const result = stats[0];
      const ratingCounts = result.ratingDistribution.reduce((acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          totalFeedback: result.totalFeedback,
          averageRating: Math.round(result.averageRating * 100) / 100,
          ratingDistribution: ratingCounts,
        },
      });
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;
