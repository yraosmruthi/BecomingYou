const mongoose = require('mongoose');
const { Schema } = mongoose;

const trendDataSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  dailyMoodScores: [
    {
      date: {
        type: Date,
        required: true,
      },
      moodScore: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
    },
  ],
  averageMood: {
    type: Number,
    min: 1,
    max: 10,
  },
  chatFrequency: {
    type: Number,
    default: 0,
    min: 0,
  },
  goalProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const TrendData = mongoose.model('TrendData', trendDataSchema);
module.exports = TrendData;