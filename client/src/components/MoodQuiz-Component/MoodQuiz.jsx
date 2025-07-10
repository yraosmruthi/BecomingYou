import  { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {useAuth} from "../../Context/Auth-context"

import Button from "../Utility-Component/Button";
import Modal from "../Utility-Component/Modal";

const MoodQuiz = ({ isOpen, onClose, onSubmit }) => {
  const { user, apiCall } = useAuth();
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");

  const moods = [
    {
      emoji: "😊",
      label: "Great",
      value: 5,
      color: "text-green-500 dark:text-green-400",
    },
    {
      emoji: "🙂",
      label: "Good",
      value: 4,
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      emoji: "😐",
      label: "Okay",
      value: 3,
      color: "text-yellow-500 dark:text-yellow-400",
    },
    {
      emoji: "🙁",
      label: "Not Great",
      value: 2,
      color: "text-orange-500 dark:text-orange-400",
    },
    {
      emoji: "😢",
      label: "Difficult",
      value: 1,
      color: "text-red-500 dark:text-red-400",
    },
  ];
  const handleSubmit = async () => {
    if (selectedMood === null) return;

    try {
      const response = await apiCall("http://localhost:3000/api/mood", {
        method: "POST",
        body: JSON.stringify({
          mood: selectedMood,
          note: note.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save mood entry");
      }

      // Call the parent component's onSubmit function with the correct format
      if (onSubmit) {
        // Pass the mood data in the format expected by ProfileDashboard
        onSubmit({
          mood: selectedMood,
          note: note.trim(),
        });
      }

      // Reset form and close modal
      setSelectedMood(null);
      setNote("");
      onClose();
    } catch (error) {
      console.error("Error saving mood entry:", error);
      alert("Failed to save mood entry. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Mood Check-in">
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          How are you feeling today?
        </p>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {moods.map((mood, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(mood.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMood === mood.value
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-400"
                  : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400"
              }`}
            >
              <div className="text-2xl mb-2">{mood.emoji}</div>
              <div className={`text-xs font-medium ${mood.color}`}>
                {mood.label}
              </div>
            </motion.button>
          ))}
        </div>

        <textarea
          placeholder="Any thoughts about your day? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl resize-none h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        <div className="flex space-x-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Skip Today
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedMood === null}
            className="flex-1"
          >
            Save Mood
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MoodQuiz;
