// routes/chatRoute.js - Fixed version with JSON parsing fix
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

// Helper function to extract JSON from markdown code blocks
const extractJsonFromMarkdown = (text) => {
  // Remove markdown code blocks if present
  const cleanText = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return cleanText;
};

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
    if (!chatSession || chatSession.userId.toString() !== userId) {
      return res.status(404).json({ error: "Session not found" });
    }
    

    const systemPrompt = generateSystemPrompt(contextData);

    // Get last 6 messages for context (can adjust this number)
    const recentMessages = chatSession.messages.slice(-6).map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Prepare content for Gemini API
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    });

    const result = await model.generateContent({
      contents: [
        ...recentMessages,
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });
    
    const response = await result.response;
    const aiReply = response.text();

    // Save the messages
    chatSession.messages.push(
      { text: message, sender: "user", timestamp: new Date() },
      { text: aiReply, sender: "ai", timestamp: new Date() }
    );
    await chatSession.save();

    return res.status(200).json({ aiResponse: aiReply });
  } catch (error) {
    console.error("Error processing message:", error);

    if (error.status === 400) {
      return res.status(400).json({
        error: "Invalid request to AI service",
        details: error.message,
      });
    }

    return res.status(500).json({
      error: "AI processing failed",
      message: error.message
          
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
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent JSON output
        },
      });

      const conversation = chatSession.messages
        .map((msg) => `${msg.sender === "user" ? "User" : "AI"}: ${msg.text}`)
        .join("\n");

      const summaryPrompt = `Please provide a concise summary of this mental health support conversation. Focus on:
1. Main topics discussed
2. User's emotional state
3. Key concerns or issues
4. Coping strategies mentioned
5. Overall emotional tone

Conversation:
${conversation}

Return ONLY a valid JSON object with this exact structure (no markdown formatting).
For emotionalTone, carefully analyze the user's emotional state and choose the MOST ACCURATE emotion from these options:

Basic: "positive", "negative", "neutral", "mixed"
Anxiety/Stress: "anxious", "worried", "stressed", "overwhelmed", "panicked", "nervous", "tense"
Depression/Sadness: "depressed", "sad", "melancholy", "grief", "disappointed", "hopeless", "empty", "numb"
Anger/Frustration: "angry", "frustrated", "irritated", "resentful", "bitter", "annoyed"
Fear/Insecurity: "fearful", "insecure", "vulnerable", "uncertain", "doubtful", "apprehensive"
Positive/Hope: "hopeful", "optimistic", "grateful", "relieved", "content", "peaceful", "joyful", "excited", "motivated", "confident", "proud", "accomplished"
Calm/Stable: "calm", "stable", "centered", "balanced", "serene"
Social: "lonely", "isolated", "rejected", "misunderstood", "supported", "connected", "loved"
Energy: "energetic", "tired", "exhausted", "drained", "burnout", "apathetic", "inspired"
Clarity: "confused", "conflicted", "indecisive", "clear", "focused", "determined"
Recovery: "traumatized", "healing", "recovering", "resilient", "empowered"
Self-Worth: "worthless", "inadequate", "guilty", "shameful", "self-critical", "self-compassionate", "accepting"
Crisis: "crisis", "suicidal", "self-harm", "dangerous"
Growth: "breakthrough", "enlightened", "transformed", "growing", "learning"

{
  "summaryText": "Brief summary of the conversation",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "emotionalTone": "most accurate emotion from the list above"
}`;

      try {
        const summaryResult = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: summaryPrompt }],
            },
          ],
        });

        const rawSummaryText = summaryResult.response.text();
        console.log("Raw summary response:", rawSummaryText);

        // Clean the response text to extract JSON
        const cleanJsonText = extractJsonFromMarkdown(rawSummaryText);
        console.log("Cleaned JSON text:", cleanJsonText);

        let summaryData;
        try {
          summaryData = JSON.parse(cleanJsonText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          // Fallback summary if JSON parsing fails
          summaryData = {
            summaryText: "Chat session completed - summary generation failed",
            keyTopics: ["general conversation"],
            emotionalTone: "neutral",
          };
        }

        // Validate the parsed data has required fields and enum values
        const validEmotionalTones = [
          // Basic Emotions
          "positive",
          "negative",
          "neutral",
          "mixed",
          // Anxiety & Stress Related
          "anxious",
          "worried",
          "stressed",
          "overwhelmed",
          "panicked",
          "nervous",
          "tense",
          // Depression & Sadness Related
          "depressed",
          "sad",
          "melancholy",
          "grief",
          "disappointed",
          "hopeless",
          "empty",
          "numb",
          // Anger & Frustration Related
          "angry",
          "frustrated",
          "irritated",
          "resentful",
          "bitter",
          "annoyed",
          // Fear & Insecurity Related
          "fearful",
          "insecure",
          "vulnerable",
          "uncertain",
          "doubtful",
          "apprehensive",
          // Positive & Hope Related
          "hopeful",
          "optimistic",
          "grateful",
          "relieved",
          "content",
          "peaceful",
          "joyful",
          "excited",
          "motivated",
          "confident",
          "proud",
          "accomplished",
          // Calm & Stable
          "calm",
          "stable",
          "centered",
          "balanced",
          "serene",
          // Social & Relationship Related
          "lonely",
          "isolated",
          "rejected",
          "misunderstood",
          "supported",
          "connected",
          "loved",
          // Energy & Motivation Related
          "energetic",
          "tired",
          "exhausted",
          "drained",
          "burnout",
          "apathetic",
          "inspired",
          // Confusion & Clarity Related
          "confused",
          "conflicted",
          "indecisive",
          "clear",
          "focused",
          "determined",
          // Trauma & Recovery Related
          "traumatized",
          "healing",
          "recovering",
          "resilient",
          "empowered",
          // Self-Worth Related
          "worthless",
          "inadequate",
          "guilty",
          "shameful",
          "self-critical",
          "self-compassionate",
          "accepting",
          // Crisis & Emergency Related
          "crisis",
          "suicidal",
          "self-harm",
          "dangerous",
          // Breakthrough & Progress Related
          "breakthrough",
          "enlightened",
          "transformed",
          "growing",
          "learning",
        ];

        if (
          !summaryData.summaryText ||
          !summaryData.keyTopics ||
          !summaryData.emotionalTone
        ) {
          console.warn("Invalid summary data structure, using fallback");
          summaryData = {
            summaryText: summaryData.summaryText || "Chat session completed",
            keyTopics: Array.isArray(summaryData.keyTopics)
              ? summaryData.keyTopics
              : ["general conversation"],
            emotionalTone: validEmotionalTones.includes(
              summaryData.emotionalTone
            )
              ? summaryData.emotionalTone
              : "neutral",
          };
        } else if (!validEmotionalTones.includes(summaryData.emotionalTone)) {
          console.warn(
            `Invalid emotionalTone value: ${summaryData.emotionalTone}, using neutral`
          );
          summaryData.emotionalTone = "neutral";
        }

        const chatSummary = new ChatSummary({
          chatSession: chatSession._id,
          ...summaryData,
        });
        await chatSummary.save();
        chatSession.summary = chatSummary._id;
        await chatSession.save();

        console.log("Summary saved successfully:", summaryData);
      } catch (summaryError) {
        console.error("Error summarizing chat:", summaryError);
        // Create a basic summary even if AI summarization fails
        const basicSummary = new ChatSummary({
          chatSession: chatSession._id,
          summaryText: "Chat session completed - automatic summary unavailable",
          keyTopics: ["general conversation"],
          emotionalTone: "neutral",
        });
        await basicSummary.save();
        chatSession.summary = basicSummary._id;
        await chatSession.save();
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
