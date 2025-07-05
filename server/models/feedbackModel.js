const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  chatSession: {
    type: Schema.Types.ObjectId,
    ref: "ChatSession",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  moodAfterChat: {
    type: String,
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});
const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;