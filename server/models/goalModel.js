const mongoose = require('mongoose');
const { Schema } = mongoose;

const goalSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["short-term", "long-term"],
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.pre("save", function (next) {
  if (this.progress >= 100) {
    this.completed = true;
  }
  next();
});

goalSchema.virtual("isOverdue").get(function () {
  return !this.completed && this.targetDate < new Date();
});

goalSchema.virtual("daysLeft").get(function () {
  if (this.completed) return 0;
  const today = new Date();
  const timeDiff = this.targetDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

goalSchema.statics.getActiveGoals = function (userId) {
  return this.find({
    userId: userId,
    completed: false,
  }).sort({ targetDate: 1 });
};

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
