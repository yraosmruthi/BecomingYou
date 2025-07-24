const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "ai"],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    summary: {
      type: Schema.Types.ObjectId,
      ref: "ChatSummary",
    },
    feedback: {
      type: Schema.Types.ObjectId,
      ref: "Feedback",
    },
    systemPrompt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


chatSessionSchema.methods.addMessage = function (sender, text) {
  this.messages.push({
    sender: sender,
    text: text,
    timestamp: new Date(),
  });
  return this.save();
};

chatSessionSchema.methods.endSession = function () {
  this.endedAt = new Date();
  return this.save();
};

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
module.exports = ChatSession;