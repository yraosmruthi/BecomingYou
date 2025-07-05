const mongoose = require('mongoose');
const { Schema } = mongoose;

const streakSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    current: {
      type: Number,
      default: 0,
      min: 0,
    },
    longest: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastEntryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

streakSchema.pre("save", function (next) {
  if (this.current > this.longest) {
    this.longest = this.current;
  }
  next();
});

streakSchema.methods.updateStreak = function (entryDate) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (!this.lastEntryDate) {
    this.current = 1;
    this.lastEntryDate = entryDate;
  } else {
    const lastEntry = new Date(this.lastEntryDate);
    const daysDiff = Math.floor((today - lastEntry) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      this.current += 1;
    } else if (daysDiff > 1) {
      this.current = 1;
    }
    this.lastEntryDate = entryDate;
  }

  if (this.current > this.longest) {
    this.longest = this.current;
  }

  return this.save();
};

const Streak = mongoose.model('Streak', streakSchema);
module.exports = Streak;