const MoodEntry = require("../models/MoodEntryModel");
const { validationResult } = require("express-validator");

// Create a new mood entry
const createMoodEntry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { mood, note } = req.body;
    const userId = req.user.uid; // Keep as uid for consistency

    // Mood mapping to ensure consistency
    const moodMappings = {
      5: {
        emoji: "😊",
        label: "Great",
        color: "text-green-500 dark:text-green-400",
      },
      4: {
        emoji: "🙂",
        label: "Good",
        color: "text-blue-500 dark:text-blue-400",
      },
      3: {
        emoji: "😐",
        label: "Okay",
        color: "text-yellow-500 dark:text-yellow-400",
      },
      2: {
        emoji: "🙁",
        label: "Not Great",
        color: "text-orange-500 dark:text-orange-400",
      },
      1: {
        emoji: "😢",
        label: "Difficult",
        color: "text-red-500 dark:text-red-400",
      },
    };

    if (!moodMappings[mood]) {
      return res.status(400).json({
        success: false,
        message: "Invalid mood value",
      });
    }

    const moodData = moodMappings[mood];

    const newMoodEntry = new MoodEntry({
      userId,
      mood: {
        emoji: moodData.emoji,
        label: moodData.label,
        value: mood,
        color: moodData.color,
      },
      notes: note || "",
      date: new Date(),
    });

    await newMoodEntry.save();

    res.status(201).json({
      success: true,
      message: "Mood entry created successfully",
      data: newMoodEntry.getMoodData(),
    });
  } catch (error) {
    console.error("Error creating mood entry:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get mood entries for a user
const getMoodEntries = async (req, res) => {
  try {
    const userId = req.user.uid; // Changed from req.user.id to req.user.uid
    const { days = 30, page = 1, limit = 10 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const moodEntries = await MoodEntry.find({
      userId,
      date: { $gte: startDate },
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEntries = await MoodEntry.countDocuments({
      userId,
      date: { $gte: startDate },
    });
    console.log("Total entries:", totalEntries);

    res.status(200).json({
      success: true,
      data: {
        entries: moodEntries.map((entry) => entry.getMoodData()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalEntries / parseInt(limit)),
          totalEntries,
          hasNext: skip + moodEntries.length < totalEntries,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get mood trend for a user
const getMoodTrend = async (req, res) => {
  try {
    const userId = req.user.uid; // Changed from req.user.id to req.user.uid
    const { days = 30 } = req.query;

    const moodTrend = await MoodEntry.getMoodTrend(userId, parseInt(days));

    res.status(200).json({
      success: true,
      data: {
        trend: moodTrend.map((entry) => entry.getMoodData()),
        period: `${days} days`,
      },
    });
  } catch (error) {
    console.error("Error fetching mood trend:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get average mood value
const getAverageMood = async (req, res) => {
  try {
    const userId = req.user.uid; // Changed from req.user.id to req.user.uid
    const { days = 30 } = req.query;

    const averageResult = await MoodEntry.getAverageMoodValue(
      userId,
      parseInt(days)
    );

    if (averageResult.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageMood: 0,
          totalEntries: 0,
          period: `${days} days`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        averageMood: Math.round(averageResult[0].averageMood * 100) / 100,
        totalEntries: averageResult[0].totalEntries,
        period: `${days} days`,
      },
    });
  } catch (error) {
    console.error("Error fetching average mood:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get mood distribution
const getMoodDistribution = async (req, res) => {
  try {
    const userId = req.user.uid; // Changed from req.user.id to req.user.uid
    const { days = 30 } = req.query;

    const distribution = await MoodEntry.getMoodDistribution(
      userId,
      parseInt(days)
    );

    res.status(200).json({
      success: true,
      data: {
        distribution,
        period: `${days} days`,
      },
    });
  } catch (error) {
    console.error("Error fetching mood distribution:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a mood entry
const updateMoodEntry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { mood, note } = req.body;
    const userId = req.user.uid; // Changed from req.user.id to req.user.uid

    const moodEntry = await MoodEntry.findOne({ _id: id, userId });

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found",
      });
    }

    await moodEntry.updateMood({ value: mood, notes: note });

    res.status(200).json({
      success: true,
      message: "Mood entry updated successfully",
      data: moodEntry.getMoodData(),
    });
  } catch (error) {
    console.error("Error updating mood entry:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a mood entry
const deleteMoodEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid; // Changed from req.user.id to req.user.uid

    const moodEntry = await MoodEntry.findOneAndDelete({ _id: id, userId });

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Mood entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get today's mood entry
const getTodaysMood = async (req, res) => {
  try {
    const userId = req.user.uid; // Changed from req.user.id to req.user.uid
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const todaysMood = await MoodEntry.findOne({
      userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: todaysMood ? todaysMood.getMoodData() : null,
    });
  } catch (error) {
    console.error("Error fetching today's mood:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createMoodEntry,
  getMoodEntries,
  getMoodTrend,
  getAverageMood,
  getMoodDistribution,
  updateMoodEntry,
  deleteMoodEntry,
  getTodaysMood,
};
