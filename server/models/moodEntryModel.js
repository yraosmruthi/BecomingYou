const mongoose = require('mongoose');
const { Schema } = mongoose;

const moodEntrySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    mood: {
      emoji: {
        type: String,
        required: true,
        enum: ["😊", "🙂", "😐", "🙁", "😢"],
      },
      label: {
        type: String,
        required: true,
        enum: ["Great", "Good", "Okay", "Not Great", "Difficult"],
      },
      value: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      color: {
        type: String,
        required: true,
        enum: [
          "text-green-500 dark:text-green-400",
          "text-blue-500 dark:text-blue-400",
          "text-yellow-500 dark:text-yellow-400",
          "text-orange-500 dark:text-orange-400",
          "text-red-500 dark:text-red-400",
        ],
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

moodEntrySchema.statics.getMoodTrend = function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    userId: userId,
    date: { $gte: startDate },
  }).sort({ date: -1 });
};

moodEntrySchema.statics.getAverageMoodValue = function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        averageMood: { $avg: "$mood.value" },
        totalEntries: { $sum: 1 },
      },
    },
  ]);
};

moodEntrySchema.statics.getMoodDistribution = function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$mood.label",
        count: { $sum: 1 },
        emoji: { $first: "$mood.emoji" },
        value: { $first: "$mood.value" },
        color: { $first: "$mood.color" },
      },
    },
    {
      $sort: { value: -1 },
    },
  ]);
};

moodEntrySchema.methods.getMoodData = function () {
  return {
    emoji: this.mood.emoji,
    label: this.mood.label,
    value: this.mood.value,
    color: this.mood.color,
    notes: this.notes,
    date: this.date,
  };
};

moodEntrySchema.methods.updateMood = function (moodData) {
  // Validate mood data consistency
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

  if (moodMappings[moodData.value]) {
    const mapping = moodMappings[moodData.value];
    this.mood = {
      emoji: mapping.emoji,
      label: mapping.label,
      value: moodData.value,
      color: mapping.color,
    };
  }

  if (moodData.notes) {
    this.notes = moodData.notes;
  }

  return this.save();
};

const MoodEntry =
  mongoose.models.MoodEntry || mongoose.model("MoodEntry", moodEntrySchema);

module.exports = MoodEntry 