// routes/chatRoute.js - Fixed version
const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../middlewares/firebase-auth");
const rateLimit = require("express-rate-limit");

const ChatSession = require("../models/chatSessionModel");
const ChatSummary = require("../models/chatSummaryModel");
const Feedback = require("../models/feedbackModel");
const Goal = require("../models/goalModel");
const MoodEntry = require("../models/moodEntryModel");

const {
  generateSystemPrompt,
  getMostFrequentMood,
  getMoodTrend,
} = require("../Controllers/chatController");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyA16AAeK6b7oEmUR9JOi0dZ1XprryBF-Wo");

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many chat messages, please slow down.",
});

router.get("/context/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.uid !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const [moodLogs, goals, recentSessions, feedbackHistory] =
      await Promise.all([
        MoodEntry.find({ userId }).sort({ date: -1 }).limit(7),
        Goal.find({ userId, isActive: true }),
        ChatSession.find({ userId })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("summary"),
        Feedback.find({ userId }).sort({ submittedAt: -1 }).limit(10),
      ]);

    const recentMood =
      moodLogs.length > 0
        ? {
            dominantMood: getMostFrequentMood(moodLogs),
            trend: getMoodTrend(moodLogs),
            entries: moodLogs.map((log) => ({
              date: log.date.toISOString().split("T")[0],
              mood: log.mood.label,
              intensity: log.mood.value,
            })),
          }
        : null;

    const previousSummary = recentSessions[0]?.summary || null;

    const contextData = {
      recentMood,
      previousSummary,
      goals,
      feedbackHistory,
      userName: req.user.name || null,
    };

    res.json({ success: true, data: contextData });
  } catch (error) {
    console.error("Error fetching context:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/session/start", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (req.user.uid !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const chatSession = new ChatSession({
      userId,
      messages: [],
      startedAt: new Date(),
    });
    await chatSession.save();

    res.json({
      success: true,
      data: { sessionId: chatSession._id, startedAt: chatSession.startedAt },
    });
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/message", verifyFirebaseToken, async (req, res) => {
  try {
    const { sessionId, userId, message, contextData } = req.body;

    // Verify the session belongs to the user
    const chatSession = await ChatSession.findById(sessionId);
    if (!chatSession || chatSession.userId !== userId) {
      return res.status(404).json({ error: "Session not found" });
    }

    const systemPrompt = generateSystemPrompt(contextData);

    // FIXED: Use systemInstruction parameter and proper content structure
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 75, // ~50 words
        temperature: 0.7,
      },
    });

    // FIXED: Send only the user message, not combined with system prompt
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    console.log(result);
    const response = await result.response;
    const aiReply = response.text();

    chatSession.messages.push(
      { text: message, sender: "user", timestamp: new Date() },
      { text: aiReply, sender: "ai", timestamp: new Date() }
    );

    await chatSession.save(); // Don't forget to save the session

    return res.status(200).json({ aiResponse: aiReply });
  } catch (error) {
    console.error("Error processing message:", error);

    // Better error handling
    if (error.status === 400) {
      return res.status(400).json({
        error: "Invalid request to AI service",
        details: error.message,
      });
    }

    return res.status(500).json({
      error: "AI processing failed",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

router.put("/session/:sessionId/end", verifyFirebaseToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chatSession = await ChatSession.findById(sessionId);
    if (!chatSession || chatSession.userId !== req.user.uid)
      return res.status(404).json({ error: "Session not found" });

    await chatSession.endSession();

    if (chatSession.messages.length > 2) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const conversation = chatSession.messages
        .map((msg) => `${msg.sender === "user" ? "User" : "AI"}: ${msg.text}`)
        .join("\n");
      const summaryPrompt = `Please provide a concise summary of this mental health support conversation. Focus on:\n1. Main topics discussed\n2. User's emotional state\n3. Key concerns or issues\n4. Coping strategies mentioned\n5. Overall emotional tone\n\nConversation:\n${conversation}\n\nProvide the summary in the following JSON format:\n{\n  "summaryText": "...",\n  "keyTopics": ["..."],\n  "emotionalTone": "..."\n}`;

      try {
        // FIXED: Use proper content structure for summary generation
        const summaryResult = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: summaryPrompt }],
            },
          ],
        });

        const summaryData = JSON.parse(summaryResult.response.text());
        const chatSummary = new ChatSummary({
          chatSession: chatSession._id,
          ...summaryData,
        });
        await chatSummary.save();
        chatSession.summary = chatSummary._id;
        await chatSession.save();
      } catch (summaryError) {
        console.error("Error summarizing chat:", summaryError);
      }
    }

    res.json({
      success: true,
      data: { sessionId: chatSession._id, endedAt: chatSession.endedAt },
    });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/feedback", verifyFirebaseToken, async (req, res) => {
  try {
    const { sessionId, userId, rating, comment, moodAfterChat } = req.body;
    if (req.user.uid !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const feedback = new Feedback({
      userId,
      chatSession: sessionId,
      rating,
      comment,
      moodAfterChat,
    });
    await feedback.save();

    await ChatSession.findByIdAndUpdate(sessionId, { feedback: feedback._id });

    res.json({
      success: true,
      data: { feedbackId: feedback._id, submittedAt: feedback.submittedAt },
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
