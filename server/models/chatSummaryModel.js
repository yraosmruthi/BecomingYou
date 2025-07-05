const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSummarySchema = new Schema({
  chatSession: {
    type: Schema.Types.ObjectId,
    ref: "ChatSession",
    required: true,
    unique: true,
  },
  summaryText: {
    type: String,
    required: true,
  },
  keyTopics: [
    {
      type: String,
      trim: true,
    },
  ],
  emotionalTone: {
    type: String,
    enum: [
      "positive",
      "negative",
      "neutral",
      "mixed",
      "anxious",
      "hopeful",
      "frustrated",
      "calm",
    ],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatSummary = mongoose.model("ChatSummary", chatSummarySchema);
module.exports = ChatSummary;