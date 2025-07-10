import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ThumbsUp, Loader2, AlertCircle } from "lucide-react";
import Button from "../Utility-Component/Button";
import Modal from "../Utility-Component/Modal";
import feedbackService from "../../services/feedbackService";

const FeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  sessionId,
  userId,
  existingFeedback = null, // For editing existing feedback
}) => {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [comment, setComment] = useState(existingFeedback?.comment || "");
  const [moodAfterChat, setMoodAfterChat] = useState(
    existingFeedback?.moodAfterChat || ""
  );
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Mood options
  const moodOptions = [
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "satisfied", label: "Satisfied", emoji: "😌" },
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "disappointed", label: "Disappointed", emoji: "😞" },
    { value: "frustrated", label: "Frustrated", emoji: "😤" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        sessionId,
        userId,
        rating,
        comment,
        moodAfterChat,
      };

      let result;

      if (existingFeedback) {
        // Update existing feedback
        result = await feedbackService.updateFeedback(
          existingFeedback._id,
          userId,
          { rating, comment, moodAfterChat }
        );
      } else {
        // Submit new feedback
        result = await feedbackService.submitFeedback(feedbackData);
      }

      if (result.success) {
        onSubmit?.(result.data);
        handleClose();
      } else {
        setError(result.message || "Failed to submit feedback");
      }
    } catch (err) {
      setError(err.message || "An error occurred while submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(existingFeedback?.rating || 0);
      setComment(existingFeedback?.comment || "");
      setMoodAfterChat(existingFeedback?.moodAfterChat || "");
      setError("");
      onClose();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);

      return (
        <motion.button
          key={starValue}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`p-1 transition-colors ${
            isActive ? "text-yellow-400" : "text-gray-300"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={isSubmitting}
        >
          <Star className="w-8 h-8 fill-current" />
        </motion.button>
      );
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {existingFeedback
            ? "Edit Your Feedback"
            : "How was your chat experience?"}
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rate your experience
            </label>
            <div className="flex justify-center gap-1 mb-2">
              {renderStars()}
            </div>
            <p className="text-sm text-gray-500">
              {rating > 0 && (
                <span>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </p>
          </div>

          {/* Mood Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How do you feel after this chat?
            </label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((mood) => (
                <motion.button
                  key={mood.value}
                  type="button"
                  onClick={() => setMoodAfterChat(mood.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    moodAfterChat === mood.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitting}
                >
                  <span className="mr-2">{mood.emoji}</span>
                  {mood.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional comments (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share any specific feedback or suggestions..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {existingFeedback ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  {existingFeedback ? "Update Feedback" : "Submit Feedback"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default FeedbackModal;
