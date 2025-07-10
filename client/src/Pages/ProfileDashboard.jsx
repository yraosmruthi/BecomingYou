import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MoodChart from "../components/Profile-Component/MoodChart";
import MoodQuiz from "../components/MoodQuiz-Component/MoodQuiz";
import GoalProgress from "../components/Profile-Component/GoalProgress";
import { useNavigate } from "react-router-dom";
import goalService from "../services/goalService";
import moodService from "../services/moodService";
import { useAuth } from "../Context/Auth-context";

import {
  MessageCircle,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import Card from "../components/Utility-Component/Card";
import Button from "../components/Utility-Component/Button";

const ProfileDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMoodQuiz, setShowMoodQuiz] = useState(false);
  const [moodData, setMoodData] = useState([]);
  const [todaysMood, setTodaysMood] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCheckedTodaysMood, setHasCheckedTodaysMood] = useState(false);

  // Fetch mood data from API
  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        if (!user?.uid) return;

        setLoading(true);

        // Fetch mood entries for the last 30 days
        const moodEntries = await moodService.getMoodEntries({
          days: 30,
          limit: 100,
        });

        // Add safety checks for the API response structure
        const entries = moodEntries?.data?.entries || [];
        console.log("Fetched mood entries:", entries);

        // Transform API data to match your component's expected format
        const transformedMoodData = entries.map((entry, index) => {
          // If no date field, generate dates going back from today
          const date =
            entry?.date ||
            (() => {
              const today = new Date();
              today.setDate(today.getDate() - (entries.length - 1 - index));
              return today.toISOString().split("T")[0];
            })();

          return {
            date,
            mood: entry?.value || 3, // Use 'value' instead of 'mood.value'
            note: entry?.notes || "",
            emoji: entry?.emoji || "😐", // Use 'emoji' instead of 'mood.emoji'
            label: entry?.label || "Unknown", // Use 'label' instead of 'mood.label'
            color: entry?.color || "#6B7280", // Use 'color' instead of 'mood.color'
          };
        });

        setMoodData(transformedMoodData);

        // Fetch today's mood specifically
        const todayMoodResponse = await moodService.getTodaysMood();
        if (todayMoodResponse?.data) {
          setTodaysMood(todayMoodResponse.data);
        }
      } catch (error) {
        console.error("Error fetching mood data:", error);
        setError("Failed to load mood data");
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, [user]);

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        if (!user?.uid) return;
        const fetchedGoals = await goalService.getGoals(user.uid);
        setGoals(fetchedGoals || []);
      } catch (error) {
        console.error("Error fetching goals for dashboard:", error);
      }
    };

    fetchGoals();
  }, [user]);

  // Check if user has logged mood today and show quiz if not
  useEffect(() => {
    const checkTodaysMood = async () => {
      try {
        if (!user?.uid || hasCheckedTodaysMood) return;

        // Wait a bit for the component to load
        await new Promise((resolve) => setTimeout(resolve, 500));

        let hasLoggedToday = false;

        // First, check if we have today's mood from the API
        if (todaysMood) {
          const today = new Date().toISOString().split("T")[0];
          const moodDate = new Date(todaysMood.date)
            .toISOString()
            .split("T")[0];
          hasLoggedToday = moodDate === today;
        }

        // If no today's mood from API, check using the service
        if (!hasLoggedToday) {
          try {
            hasLoggedToday = await moodService.hasLoggedMoodToday();
          } catch (error) {
            console.error("Error checking today's mood:", error);
            // If there's an error checking, assume they haven't logged
            hasLoggedToday = false;
          }
        }

        // If no today's mood found, check the moodData array as a fallback
        if (!hasLoggedToday && moodData.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          const todayEntry = moodData.find((entry) => entry.date === today);
          hasLoggedToday = !!todayEntry;
        }

        setHasCheckedTodaysMood(true);

        // Show mood quiz if user hasn't logged today
        if (!hasLoggedToday) {
          // Small delay to ensure smooth UI transition
          setTimeout(() => {
            setShowMoodQuiz(true);
          }, 800);
        }
      } catch (error) {
        console.error("Error checking today's mood:", error);
        setHasCheckedTodaysMood(true);
        // If there's an error, show the quiz anyway after a delay
        setTimeout(() => {
          setShowMoodQuiz(true);
        }, 1000);
      }
    };

    // Only check after data has loaded
    if (!loading && user?.uid) {
      checkTodaysMood();
    }
  }, [user, loading, todaysMood, moodData, hasCheckedTodaysMood]);

  const handleMoodSubmit = async (moodEntry) => {
    try {
      // Validate mood entry before submission
      if (!moodEntry || typeof moodEntry.mood !== "number") {
        setError("Invalid mood entry");
        return;
      }

      // Submit mood entry to API
      await moodService.createMoodEntry({
        mood: moodEntry.mood,
        note: moodEntry.note || "",
      });

      // Update local state with proper structure
      const newMoodEntry = {
        date: new Date().toISOString().split("T")[0],
        mood: moodEntry.mood,
        note: moodEntry.note || "",
        emoji: getMoodEmoji(moodEntry.mood),
        label: getMoodLabel(moodEntry.mood),
        color: getMoodColor(moodEntry.mood),
      };

      setMoodData((prev) => [...prev, newMoodEntry]);
      setTodaysMood({
        mood: {
          value: moodEntry.mood,
          emoji: getMoodEmoji(moodEntry.mood),
          label: getMoodLabel(moodEntry.mood),
        },
        notes: moodEntry.note || "",
        date: new Date().toISOString(),
      });

      // Close the quiz
      setShowMoodQuiz(false);
      // Clear any existing error
      setError(null);
    } catch (error) {
      console.error("Error submitting mood entry:", error);
      setError("Failed to save mood entry");
    }
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      5: "😊",
      4: "🙂",
      3: "😐",
      2: "🙁",
      1: "😢",
    };
    return emojis[mood] || "😐";
  };

  const getMoodLabel = (mood) => {
    const labels = {
      5: "Great",
      4: "Good",
      3: "Okay",
      2: "Not Great",
      1: "Difficult",
    };
    return labels[mood] || "Unknown";
  };

  const getMoodColor = (mood) => {
    const colors = {
      5: "#10B981",
      4: "#34D399",
      3: "#6B7280",
      2: "#F59E0B",
      1: "#EF4444",
    };
    return colors[mood] || "#6B7280";
  };

  // Get current mood to display with proper null checks
  const getCurrentMood = () => {
    if (todaysMood?.mood) {
      return {
        emoji: todaysMood.mood.emoji || "😐",
        label: todaysMood.mood.label || "Unknown",
        hasLogged: true,
      };
    }

    // Check if we have today's mood in moodData
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = moodData.find((entry) => entry.date === today);
    if (todayEntry) {
      return {
        emoji: todayEntry.emoji || getMoodEmoji(todayEntry.mood),
        label: todayEntry.label || getMoodLabel(todayEntry.mood),
        hasLogged: true,
      };
    }

    // If no today's mood, check if we have any recent mood data
    if (moodData && moodData.length > 0) {
      const latestMood = moodData[moodData.length - 1];
      if (latestMood) {
        return {
          emoji: latestMood.emoji || getMoodEmoji(latestMood.mood),
          label: latestMood.label || getMoodLabel(latestMood.mood),
          hasLogged: false,
        };
      }
    }

    return {
      emoji: "😐",
      label: "No mood logged",
      hasLogged: false,
    };
  };

  const currentMood = getCurrentMood();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome back, {user?.displayName || user?.email || "User"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's your wellness dashboard
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <MoodChart moodData={moodData} userId={user?.uid} />
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
            <Calendar className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
            Today's Status
          </h3>
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between p-3 rounded-lg ${
                currentMood.hasLogged
                  ? "bg-green-50 dark:bg-green-900/30"
                  : "bg-yellow-50 dark:bg-yellow-900/30"
              }`}
            >
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Mood Check-in
              </span>
              {currentMood.hasLogged ? (
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">{currentMood.emoji}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentMood.hasLogged ? "Today's mood" : "Last recorded mood"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {currentMood.label}
              </p>
            </div>
            {!currentMood.hasLogged && (
              <Button
                onClick={() => setShowMoodQuiz(true)}
                className="w-full mt-3"
                size="sm"
              >
                Log Today's Mood
              </Button>
            )}
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
