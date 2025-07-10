const Feedback = require("../models/feedbackModel");
const ChatSession = require("../models/chatSessionModel"); // Assuming you have this model

// Submit feedback for a chat session
const submitFeedback = async (req, res) => {
  try {
    const { sessionId, userId, rating, comment, moodAfterChat } = req.body;

    // Validate required fields
    if (!sessionId || !userId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Session ID, User ID, and rating are required",
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if chat session exists
    const chatSession = await ChatSession.findById(sessionId);
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    // Check if user owns the session
    if (chatSession.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to submit feedback for this session",
      });
    }

    // Check if feedback already exists for this session
    const existingFeedback = await Feedback.findOne({
      chatSession: sessionId,
      userId: userId,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted for this session",
      });
    }

    // Create new feedback
    const feedback = new Feedback({
      userId,
      chatSession: sessionId,
      rating,
      comment: comment || "",
      moodAfterChat: moodAfterChat || "",
    });

    await feedback.save();

    // Update chat session to mark feedback as submitted
    await ChatSession.findByIdAndUpdate(sessionId, {
      feedbackSubmitted: true,
      feedbackId: feedback._id,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: {
        feedbackId: feedback._id,
        rating: feedback.rating,
        submittedAt: feedback.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get feedback for a specific session
const getFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const feedback = await Feedback.findOne({
      chatSession: sessionId,
      userId: userId,
    }).populate("chatSession", "startTime endTime");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found for this session",
      });
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all feedback for a user
const getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ userId })
      .populate("chatSession", "startTime endTime duration")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user feedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get feedback analytics for a user
const getFeedbackAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        submittedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const analytics = await Feedback.aggregate([
      {
        $match: {
          userId: userId,
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating",
          },
          moodDistribution: {
            $push: "$moodAfterChat",
          },
        },
      },
    ]);

    if (analytics.length === 0) {
      return res.json({
        success: true,
        data: {
          totalFeedback: 0,
          averageRating: 0,
          ratingDistribution: {},
          moodDistribution: {},
        },
      });
    }

    const result = analytics[0];

    // Calculate rating distribution
    const ratingCounts = result.ratingDistribution.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    // Calculate mood distribution
    const moodCounts = result.moodDistribution
      .filter((mood) => mood) // Filter out empty moods
      .reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {});

    res.json({
      success: true,
      data: {
        totalFeedback: result.totalFeedback,
        averageRating: Math.round(result.averageRating * 100) / 100,
        ratingDistribution: ratingCounts,
        moodDistribution: moodCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update feedback (within a time limit)
const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { userId, rating, comment, moodAfterChat } = req.body;

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Check if user owns the feedback
    if (feedback.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this feedback",
      });
    }

    // Check if feedback was submitted within the last 24 hours (editable period)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (feedback.submittedAt < twentyFourHoursAgo) {
      return res.status(400).json({
        success: false,
        message: "Feedback can only be updated within 24 hours of submission",
      });
    }

    // Update feedback
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      {
        rating: rating || feedback.rating,
        comment: comment !== undefined ? comment : feedback.comment,
        moodAfterChat:
          moodAfterChat !== undefined ? moodAfterChat : feedback.moodAfterChat,
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  submitFeedback,
  getFeedback,
  getUserFeedback,
  getFeedbackAnalytics,
  updateFeedback,
};
