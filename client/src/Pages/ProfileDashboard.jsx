import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MoodChart from "../components/Profile-Component/MoodChart";
import MoodQuiz from "../components/MoodQuiz-Component/MoodQuiz";
import GoalProgress from "../components/Profile-Component/GoalProgress";
import { useNavigate } from "react-router-dom";

import {
  MessageCircle,
  Calendar,
  CheckCircle,
} from "lucide-react";

import Card from "../components/Utility-Component/Card";
import Button from "../components/Utility-Component/Button";

const ProfileDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [showMoodQuiz, setShowMoodQuiz] = useState(false);
  const [moodData, setMoodData] = useState([
    { date: "2025-06-23", mood: 4, note: "Good day overall" },
    { date: "2025-06-24", mood: 3, note: "Feeling okay" },
    { date: "2025-06-25", mood: 5, note: "Great day!" },
    { date: "2025-06-26", mood: 2, note: "Struggling a bit" },
    { date: "2025-06-27", mood: 4, note: "Better today" },
    { date: "2025-06-28", mood: 3, note: "Neutral mood" },
    { date: "2025-06-29", mood: 4, note: "Feeling positive" },
  ]);

  const [goals] = useState([
    { id: 1, title: "Daily meditation", progress: 75, type: "short-term" },
    { id: 2, title: "Exercise 3x per week", progress: 60, type: "short-term" },
    {
      id: 3,
      title: "Read 12 books this year",
      progress: 40,
      type: "long-term",
    },
  ]);

  useEffect(() => {
    // Show mood quiz when component mounts
    const timer = setTimeout(() => {
      setShowMoodQuiz(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMoodSubmit = (moodEntry) => {
    setMoodData((prev) => [...prev, moodEntry]);
  };

  const todaysMood = moodData[moodData.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome back, smruthi!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's your wellness dashboard
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <MoodChart moodData={moodData} />
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
            <Calendar className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
            Today's Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Mood Check-in
              </span>
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">
                {todaysMood?.mood === 5 && "😊"}
                {todaysMood?.mood === 4 && "🙂"}
                {todaysMood?.mood === 3 && "😐"}
                {todaysMood?.mood === 2 && "🙁"}
                {todaysMood?.mood === 1 && "😢"}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current mood
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <GoalProgress goals={goals} />

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
            <MessageCircle className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
            AI Support
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ready to talk? Your AI companion is here to listen and support you.
          </p>
          <Button onClick={() => navigate("/chat")} className="w-full">
            Start Chat Session
            <MessageCircle className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>

      <MoodQuiz
        isOpen={showMoodQuiz}
        onClose={() => setShowMoodQuiz(false)}
        onSubmit={handleMoodSubmit}
      />
    </div>
  );
};

export default ProfileDashboard;
