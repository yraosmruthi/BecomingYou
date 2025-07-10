const Goal = require("../models/goalModel");
const { validationResult } = require("express-validator");

// Get all goals for a user
const getGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { filter, sort } = req.query;

    let query = { userId };

    // Apply filters
    if (filter === "active") {
      query.isActive = true;
    } else if (filter === "completed") {
      query.completed = true;
    } else if (filter === "short-term" || filter === "long-term") {
      query.type = filter;
    }

    // Set default sort
    let sortQuery = { createdAt: -1 };
    if (sort === "targetDate") {
      sortQuery = { targetDate: 1 };
    } else if (sort === "progress") {
      sortQuery = { progress: -1 };
    }

    const goals = await Goal.find(query).sort(sortQuery);

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching goals",
    });
  }
};

// Get a single goal by ID
const getGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching goal",
    });
  }
};

// Create a new goal
const createGoal = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { userId, title, description, type, targetDate } = req.body;

    const goal = new Goal({
      userId,
      title,
      description,
      type,
      targetDate,
      progress: 0,
      completed: false,
      isActive: true,
    });

    await goal.save();

    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      data: goal,
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating goal",
    });
  }
};

// Update a goal
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow direct updates to computed fields
    delete updates.completed;
    delete updates.isActive;

    const goal = await Goal.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating goal",
    });
  }
};

// Update goal progress
const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      });
    }

    const goal = await Goal.findByIdAndUpdate(
      id,
      { progress },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: goal,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating progress",
    });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findByIdAndDelete(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting goal",
    });
  }
};

// Get goal statistics for a user
const getGoalStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Goal.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalGoals: { $sum: 1 },
          completedGoals: {
            $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] },
          },
          activeGoals: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          averageProgress: { $avg: "$progress" },
          shortTermGoals: {
            $sum: { $cond: [{ $eq: ["$type", "short-term"] }, 1, 0] },
          },
          longTermGoals: {
            $sum: { $cond: [{ $eq: ["$type", "long-term"] }, 1, 0] },
          },
        },
      },
    ]);

    const result =
      stats.length > 0
        ? stats[0]
        : {
            totalGoals: 0,
            completedGoals: 0,
            activeGoals: 0,
            averageProgress: 0,
            shortTermGoals: 0,
            longTermGoals: 0,
          };

    // Remove the _id field
    delete result._id;

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching goal stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching goal statistics",
    });
  }
};

// Get overdue goals
const getOverdueGoals = async (req, res) => {
  try {
    const { userId } = req.params;

    const overdueGoals = await Goal.find({
      userId,
      targetDate: { $lt: new Date() },
      completed: false,
      isActive: true,
    }).sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      count: overdueGoals.length,
      data: overdueGoals,
    });
  } catch (error) {
    console.error("Error fetching overdue goals:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching overdue goals",
    });
  }
};

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateProgress,
  deleteGoal,
  getGoalStats,
  getOverdueGoals,
};
