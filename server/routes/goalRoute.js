const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const router = express.Router();

// Import Firebase authentication middleware
const verifyFirebaseToken = require("../middlewares/firebase-auth");

const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateProgress,
  deleteGoal,
  getGoalStats,
  getOverdueGoals,
} = require("../Controllers/goalController");

const Goal = require("../models/goalModel");
// Validation error handler
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

// Middleware to verify user owns the resource
const verifyGoalOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid; // From Firebase decoded token

    // Check if goal belongs to authenticated user
    const Goal = require("../models/goalModel");
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    if (goal.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this goal",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying goal ownership",
    });
  }
};

// Middleware to verify user can access user-specific routes
const verifyUserAccess = (req, res, next) => {
  const { userId } = req.params;
  const authenticatedUserId = req.user.uid; // From Firebase decoded token

  if (userId !== authenticatedUserId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized to access this user's data",
    });
  }

  next();
};

// Validation middleware
const validateGoal = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),
  body("type")
    .isIn(["short-term", "long-term"])
    .withMessage("Type must be either short-term or long-term"),
  body("targetDate")
    .isISO8601()
    .toDate()
    .withMessage("Target date must be a valid date"),
  // Remove userId from validation since it comes from token
];

const validateProgress = [
  body("progress")
    .isInt({ min: 0, max: 100 })
    .withMessage("Progress must be an integer between 0 and 100"),
];

const validateObjectId = [
  param("id").isMongoId().withMessage("Invalid goal ID format"),
];

const validateUserId = [
  param("userId").notEmpty().withMessage("User ID is required"),
];

// Apply Firebase authentication to all routes
router.use(verifyFirebaseToken);

// Routes

// GET /api/goals/user/:userId - Get all goals for a user
router.get(
  "/user/:userId",
  validateUserId,
  handleValidationErrors,
  verifyUserAccess,
  getGoals
);

// GET /api/goals/user/:userId/stats - Get goal statistics for a user
router.get(
  "/user/:userId/stats",
  validateUserId,
  handleValidationErrors,
  verifyUserAccess,
  getGoalStats
);

// GET /api/goals/user/:userId/overdue - Get overdue goals for a user
router.get(
  "/user/:userId/overdue",
  validateUserId,
  handleValidationErrors,
  verifyUserAccess,
  getOverdueGoals
);

// GET /api/goals/:id - Get a specific goal
router.get(
  "/:id",
  validateObjectId,
  handleValidationErrors,
  verifyGoalOwnership,
  getGoal
);

// POST /api/goals - Create a new goal
router.post("/", validateGoal, handleValidationErrors, createGoal);

// PUT /api/goals/:id - Update a goal
router.put(
  "/:id",
  validateObjectId,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title must be between 1 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("type")
      .optional()
      .isIn(["short-term", "long-term"])
      .withMessage("Type must be either short-term or long-term"),
    body("targetDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Target date must be a valid date"),
    body("progress")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Progress must be an integer between 0 and 100"),
  ],
  handleValidationErrors,
  verifyGoalOwnership,
  updateGoal
);

// PATCH /api/goals/:id/progress - Update goal progress
router.patch(
  "/:id/progress",
  validateObjectId,
  validateProgress,
  handleValidationErrors,
  verifyGoalOwnership,
  updateProgress
);

// DELETE /api/goals/:id - Delete a goal
router.delete(
  "/:id",
  validateObjectId,
  handleValidationErrors,
  verifyGoalOwnership,
  deleteGoal
);

module.exports = router;
