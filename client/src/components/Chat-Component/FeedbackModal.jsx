import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ThumbsUp } from "lucide-react";
import Button from "../Utility-Component/Button";
import Modal from "../Utility-Component/Modal";

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [currentMood, setCurrentMood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    {
      emoji: "😊",
      label: "Much Better",
      value: 5,
      color:
        "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-400",
    },
    {
      emoji: "🙂",
      label: "Better",
      value: 4,
      color:
        "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-400",
    },
    {
      emoji: "😐",
      label: "Same",
      value: 3,
      color:
        "bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-400",
    },
    {
      emoji: "🙁",
      label: "Worse",
      value: 2,
      color:
        "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-400",
    },
    {
      emoji: "😢",
      label: "Much Worse",
      value: 1,
      color: "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-400",
    },
  ];

  const handleSubmit = async () => {
    if (!rating || !currentMood) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        rating,
        comment: feedback,
        moodAfterChat: currentMood,
      });

      // Reset form
      setRating(0);
      setFeedback("");
      setCurrentMood(null);

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setFeedback("");
    setCurrentMood(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Session Feedback">
      <div className="p-6 space-y-6">
        {/* Session Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-medium mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-purple-500" />
            How helpful was this conversation?
          </h4>
          <div className="flex space-x-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                className={`p-2 rounded-full transition-all ${
                  star <= rating
                    ? "text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30"
                    : "text-gray-300 dark:text-gray-600 hover:text-yellow-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </motion.button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {rating > 0 && (
              <span>
                {rating === 1 && "Not helpful"}
                {rating === 2 && "Slightly helpful"}
                {rating === 3 && "Moderately helpful"}
                {rating === 4 && "Very helpful"}
                {rating === 5 && "Extremely helpful"}
              </span>
            )}
          </p>
        </motion.div>

        {/* Mood After Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-medium mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            How are you feeling now?
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood, index) => (
              <motion.button
                key={mood.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMood(mood.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentMood === mood.value
                    ? `${mood.color} border-2 shadow-md`
                    : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 hover:shadow-sm"
                }`}
              >
                <motion.div
                  className="text-2xl mb-1"
                  animate={
                    currentMood === mood.value ? { scale: [1, 1.2, 1] } : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  {mood.emoji}
                </motion.div>
                <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                  {mood.label}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Additional Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="font-medium mb-3 text-gray-800 dark:text-white">
            Any additional thoughts? (Optional)
          </h4>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts about this session..."
            className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl resize-none h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            rows={3}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex space-x-3 pt-4"
        >
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={!rating || !currentMood || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 pt-2">
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              rating > 0 ? "bg-purple-500" : "bg-gray-300"
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              currentMood ? "bg-purple-500" : "bg-gray-300"
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              feedback.trim() ? "bg-purple-500" : "bg-gray-300"
            }`}
          />
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackModal;
