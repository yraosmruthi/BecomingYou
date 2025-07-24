// controllers/chatController.js - Updated with chat summary integration
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatSession = require("../models/chatSessionModel");
const ChatSummary = require("../models/chatSummaryModel");
const Feedback = require("../models/feedbackModel");
const Goal = require("../models/goalModel");
const MoodEntry = require("../models/moodEntryModel");

const genAI = new GoogleGenerativeAI("AIzaSyA16AAeK6b7oEmUR9JOi0dZ1XprryBF-Wo");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateSystemPrompt = (contextData) => {
  const {
    recentMood,
    previousSummary,
    goals,
    feedbackHistory,
    userName,
    chatSummaries,
  } = contextData;

  let systemPrompt = `You are BecomingYou's AI mental health coach - a proactive, supportive companion who provides practical advice and actionable guidance.

CORE BEHAVIOR:
- You are an ADVISOR, and a LISTENER. Your primary role is be helpful and listen when user wants to speak and give advice on situation.
- Be direct, encouraging, and  compassionate.
- Keep responses SHORT (1-2 sentences) unless giving specific advice that requires more detail.
- Only write longer responses (up to 2 short paragraphs) when providing detailed coping strategies or step-by-step guidance.
- Always aim to move the conversation forward with actionable suggestions.

RESPONSE STYLE:
- Start with brief validation, then quickly pivot to questions to understand the users situation and then GIVE ADVICE on the situation.
- Use encouraging, confident language that instills hope and motivation.
- Offer specific, practical suggestions rather than general statements.
- Ask targeted questions to understand what specific help they need.
- Celebrate progress and encourage small wins.

WHEN TO GIVE LONGER RESPONSES:
- When explaining breathing techniques, grounding exercises, or coping strategies
- When providing step-by-step guidance for goal-setting or problem-solving
- When the user specifically asks for detailed advice or explanation
- When addressing crisis situations (while directing to professional help)

KEEP SHORT FOR:
- General check-ins and mood acknowledgments
- Simple encouragement or validation
- Follow-up questions
- Casual conversation

Remember: You're here to help users take action and feel empowered, and also listen when required and make them feel heard.`;

  if (userName) {
    systemPrompt += `\n\nThe user's name is ${userName}.`;
  }

  if (recentMood) {
    systemPrompt += `\n\nRECENT MOOD CONTEXT:\n- Dominant mood (last 7 days): ${
      recentMood.dominantMood
    }\n- Mood trend: ${recentMood.trend}\n- Recent entries: ${recentMood.entries
      .map((entry) => `${entry.date}: ${entry.mood} (${entry.intensity}/10)`)
      .join(", ")}`;
  }

  // Enhanced previous summary section
  if (previousSummary) {
    systemPrompt += `\n\nPREVIOUS CONVERSATION:\n- Summary: ${
      previousSummary.summaryText
    }\n- Topics discussed: ${previousSummary.keyTopics.join(
      ", "
    )}\n- Emotional tone: ${
      previousSummary.emotionalTone
    }\n- Use this context to provide continuity and follow up on previous discussions.`;
  }

  // Add chat summaries from multiple sessions
  if (chatSummaries && chatSummaries.length > 0) {
    systemPrompt += `\n\nCHAT HISTORY SUMMARIES (most recent first):`;
    chatSummaries.forEach((summary, index) => {
      systemPrompt += `\n${index + 1}. ${
        summary.summaryText
      } (Topics: ${summary.keyTopics.join(", ")}, Tone: ${
        summary.emotionalTone
      })`;
    });
    systemPrompt += `\n- Use this context to give better personalised responses.`;
  }

  if (goals && goals.length > 0) {
    systemPrompt += `\n\nUSER'S ACTIVE GOALS:`;
    goals.forEach((goal) => {
      systemPrompt += `\n- ${goal.title}: ${goal.description} (Progress: ${goal.progress}%)`;
    });
    systemPrompt += `\n- Help the user make progress on these goals with specific actionable steps.`;
  }

  if (feedbackHistory && feedbackHistory.length > 0) {
    const avgRating =
      feedbackHistory.reduce((sum, f) => sum + f.rating, 0) /
      feedbackHistory.length;
    systemPrompt += `\n\nFEEDBACK HISTORY:\n- Average rating: ${avgRating.toFixed(
      1
    )}/5\n- Recent feedback: ${feedbackHistory
      .map((f) => f.comment)
      .filter((c) => c)
      .join("; ")}`;
  }

  systemPrompt += `\n\nACTION PRIORITIES:
1. Give specific, actionable advice based on the user's context
2. Reference their chat summary to show you remember and care about their progress
3. Keep responses concise unless detailed guidance is needed
4. Always end with either a suggestion, question, or next step
5. Be encouraging but realistic about what they can achieve`;

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
