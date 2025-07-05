const mongoose = require('mongoose');
const { Schema } = mongoose;

const responseTagPreferenceSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tags: [
      {
        type: String,
        enum: [
          "motivational",
          "casual",
          "professional",
          "empathetic",
          "direct",
          "gentle",
          "encouraging",
          "analytical",
        ],
        trim: true,
      },
    ],
    preferredStyle: {
      type: String,
      enum: ["formal", "casual", "friendly", "professional", "empathetic"],
      default: "friendly",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ResponseTagPreference = mongoose.model('ResponseTagPreference', responseTagPreferenceSchema);
module.exports = ResponseTagPreference;