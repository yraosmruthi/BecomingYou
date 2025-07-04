import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  
  Star
  
} from "lucide-react";

import Button from "../Utility-Component/Button";
import Card from "../Utility-Component/Card";
import Modal from "../Utility-Component/Modal";
import Input from "../Utility-Component/Input";
 
 const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [currentMood, setCurrentMood] = useState(null);
  
    const moods = [
      { emoji: "😊", label: "Much Better", value: 5 },
      { emoji: "🙂", label: "Better", value: 4 },
      { emoji: "😐", label: "Same", value: 3 },
      { emoji: "🙁", label: "Worse", value: 2 },
      { emoji: "😢", label: "Much Worse", value: 1 },
    ];
  
    const handleSubmit = () => {
      onSubmit({ rating, feedback, moodAfterChat: currentMood });
      onClose();
      setRating(0);
      setFeedback("");
      setCurrentMood(null);
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Session Feedback">
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-medium mb-3 text-gray-800 dark:text-white">How was this conversation?</h4>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                  }`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
  
          <div>
            <h4 className="font-medium mb-3 text-gray-800 dark:text-white">How are you feeling now?</h4>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setCurrentMood(mood.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    currentMood === mood.value
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-400"
                      : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400"
                  }`}
                >
                  <div className="text-xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>
  
          <div>
            <h4 className="font-medium mb-3 text-gray-800 dark:text-white">Any suggestions?</h4>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about this session..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl resize-none h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
  
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Submit Feedback
            </Button>
          </div>
        </div>
      </Modal>
    );
  };
  
  export default FeedbackModal