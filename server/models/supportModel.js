const mongoose = require('mongoose');
const { Schema } = mongoose;

const supportSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    preferredSupportType: {
      type: String,
      enum: ["AI only", "AI + human", "human only", "crisis hotline"],
      default: "AI only",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Support = mongoose.model('Support', supportSchema);
module.exports = Support;