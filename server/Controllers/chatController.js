// controllers/chatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatSession = require("../models/chatSessionModel");
const ChatSummary = require("../models/chatSummaryModel");
const Feedback = require("../models/feedbackModel");
const Goal = require("../models/goalModel");
const MoodEntry = require("../models/moodEntryModel");

const genAI = new GoogleGenerativeAI("AIzaSyA16AAeK6b7oEmUR9JOi0dZ1XprryBF-Wo");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateSystemPrompt = (contextData) => {
  const { recentMood, previousSummary, goals, feedbackHistory, userName } =
    contextData;

  let systemPrompt = `You are a compassionate AI mental health support companion for the BecomingYou app. You provide empathetic, non-judgmental support while maintaining appropriate boundaries.

IMPORTANT GUIDELINES:
- Keep responses under 50 words unless specifically asked for details.
- You are NOT a licensed therapist or medical professional
- Always encourage users to seek professional help for serious mental health concerns
- Provide emotional support, active listening, and coping strategies
- Use a warm, empathetic, and non-judgmental tone
- Ask thoughtful follow-up questions to help users explore their feelings
- Suggest practical coping techniques when appropriate
- Remember that you're having a conversation, not giving a lecture
- Be concise and do not overwhelm users with information

`;

  if (userName) {
    systemPrompt += `The user's name is ${userName}.\n`;
  }

  if (recentMood) {
    systemPrompt += `RECENT MOOD CONTEXT:\n- User's dominant mood in the last 7 days: ${
      recentMood.dominantMood
    }\n- Mood trend: ${
      recentMood.trend
    }\n- Recent mood entries: ${recentMood.entries
      .map((entry) => `${entry.date}: ${entry.mood} (${entry.intensity}/10)`)
      .join(", ")}\n\n`;
  }

  if (previousSummary) {
    systemPrompt += `PREVIOUS CONVERSATION CONTEXT:\n- Last conversation summary: ${
      previousSummary.summaryText
    }\n- Key topics discussed: ${previousSummary.keyTopics.join(
      ", "
    )}\n- Emotional tone: ${previousSummary.emotionalTone}\n\n`;
  }

  if (goals && goals.length > 0) {
    systemPrompt += `USER'S GOALS:\n${goals
      .map(
        (goal) =>
          `- ${goal.title}: ${goal.description} (Progress: ${goal.progress}%)`
      )
      .join("\n")}\n\n`;
  }

  if (feedbackHistory && feedbackHistory.length > 0) {
    const avgRating =
      feedbackHistory.reduce((sum, f) => sum + f.rating, 0) /
      feedbackHistory.length;
    systemPrompt += `FEEDBACK HISTORY:\n- Average session rating: ${avgRating.toFixed(
      1
    )}/5\n- Recent feedback themes: ${feedbackHistory
      .map((f) => f.comment)
      .filter((c) => c)
      .join("; ")}\n\n`;
  }

  systemPrompt += `Remember to:\n1. Acknowledge the user's context naturally in conversation\n2. Be curious about their current state\n3. Offer support without being prescriptive\n4. Validate their feelings and experiences\n5. Suggest coping strategies when appropriate\n6. Encourage professional help when needed`;

  return systemPrompt;
};

const getMostFrequentMood = (moodLogs) => {
  const moodCounts = {};
  moodLogs.forEach((log) => {
    moodCounts[log.mood.label] = (moodCounts[log.mood.label] || 0) + 1;
  });
  return Object.keys(moodCounts).reduce((a, b) =>
    moodCounts[a] > moodCounts[b] ? a : b
  );
};

const getMoodTrend = (moodLogs) => {
  if (moodLogs.length < 2) return "stable";
  const recent = moodLogs.slice(0, 3);
  const older = moodLogs.slice(3, 6);

  const recentAvg =
    recent.reduce((sum, log) => sum + log.mood.value, 0) / recent.length;
  const olderAvg =
    older.reduce((sum, log) => sum + log.mood.value, 0) / older.length;

  if (recentAvg > olderAvg + 0.5) return "improving";
  if (recentAvg < olderAvg - 0.5) return "declining";
  return "stable";
};

module.exports = {
  generateSystemPrompt,
  getMostFrequentMood,
  getMoodTrend,
};
 