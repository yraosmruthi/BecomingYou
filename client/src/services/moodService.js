import axios from "axios";
import { auth } from "../components/Auth/Firebase-config"; // Assuming you have firebase config file
import { onAuthStateChanged, signOut } from "firebase/auth";

const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add Firebase auth token to requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Error getting Firebase token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - sign out user
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error("Error signing out:", signOutError);
      }
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const moodService = {
  // Initialize auth state listener
  initAuthStateListener: () => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is signed out, redirect to login
        window.location.href = "/login";
      }
    });
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!auth.currentUser;
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Get current user's ID token
  getCurrentUserToken: async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        return await user.getIdToken();
      } catch (error) {
        console.error("Error getting user token:", error);
        return null;
      }
    }
    return null;
  },

  // Create a new mood entry
  createMoodEntry: async (moodData) => {
    try {
      const response = await api.post("/mood", moodData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create mood entry"
      );
    }
  },

  // Get mood entries with optional parameters
  getMoodEntries: async (params = {}) => {
    try {
      const { days = 30, page = 1, limit = 10 } = params;
      const response = await api.get("/mood", {
        params: { days, page, limit },
      });
      console.log("Mood entries response:", response.data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch mood entries"
      );
    }
  },

  // Get today's mood entry
  getTodaysMood: async () => {
    try {
      const response = await api.get("/mood/today");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch today's mood"
      );
    }
  },

  // Get mood trend data
  getMoodTrend: async (days = 30) => {
    try {
      const response = await api.get("/mood/trend", {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch mood trend"
      );
    }
  },

  // Get average mood statistics
  getAverageMood: async (days = 30) => {
    try {
      const response = await api.get("/mood/average", {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch average mood"
      );
    }
  },

  // Get mood distribution
  getMoodDistribution: async (days = 30) => {
    try {
      const response = await api.get("/mood/distribution", {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch mood distribution"
      );
    }
  },

  // Update a mood entry
  updateMoodEntry: async (id, moodData) => {
    try {
      const response = await api.put(`/mood/${id}`, moodData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update mood entry"
      );
    }
  },

  // Delete a mood entry
  deleteMoodEntry: async (id) => {
    try {
      const response = await api.delete(`/mood/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete mood entry"
      );
    }
  },

  // Get comprehensive mood analytics
  getMoodAnalytics: async (days = 30) => {
    try {
      const [trend, average, distribution] = await Promise.all([
        moodService.getMoodTrend(days),
        moodService.getAverageMood(days),
        moodService.getMoodDistribution(days),
      ]);

      return {
        trend: trend.data,
        average: average.data,
        distribution: distribution.data,
      };
    } catch (error) {
      throw new Error("Failed to fetch mood analytics");
    }
  },

  // Helper function to format mood data for chart
  formatMoodDataForChart: (moodEntries) => {
    return moodEntries.map((entry) => ({
      date: entry.date,
      mood: entry.value,
      note: entry.notes || "",
      emoji: entry.emoji,
      label: entry.label,
      color: entry.color,
    }));
  },

  // Helper function to check if user has logged mood today
  hasLoggedMoodToday: async () => {
    try {
      const response = await moodService.getTodaysMood();
      return response.data !== null;
    } catch (error) {
      return false;
    }
  },

  // Get mood insights (streaks, patterns, etc.)
  getMoodInsights: async (days = 30) => {
    try {
      const response = await moodService.getMoodEntries({ days, limit: 100 });
      const entries = response.data.entries;

      if (!entries || entries.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          averageWeekdayMood: 0,
          averageWeekendMood: 0,
          mostCommonMood: null,
          improvementTrend: "stable",
        };
      }

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      let checkDate = new Date(today);

      for (let i = 0; i < days; i++) {
        const dateString = checkDate.toISOString().split("T")[0];
        const hasEntry = entries.some(
          (entry) => entry.date.split("T")[0] === dateString
        );

        if (hasEntry) {
          currentStreak++;
        } else {
          break;
        }

        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      const allDates = entries.map((entry) => entry.date.split("T")[0]).sort();

      for (let i = 0; i < allDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(allDates[i - 1]);
          const currentDate = new Date(allDates[i]);
          const diffDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Calculate weekday vs weekend mood
      const weekdayMoods = [];
      const weekendMoods = [];

      entries.forEach((entry) => {
        const date = new Date(entry.date);
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekendMoods.push(entry.value);
        } else {
          weekdayMoods.push(entry.value);
        }
      });

      const averageWeekdayMood =
        weekdayMoods.length > 0
          ? weekdayMoods.reduce((sum, mood) => sum + mood, 0) /
            weekdayMoods.length
          : 0;

      const averageWeekendMood =
        weekendMoods.length > 0
          ? weekendMoods.reduce((sum, mood) => sum + mood, 0) /
            weekendMoods.length
          : 0;

      // Find most common mood
      const moodCounts = {};
      entries.forEach((entry) => {
        moodCounts[entry.label] = (moodCounts[entry.label] || 0) + 1;
      });

      const mostCommonMood = Object.keys(moodCounts).reduce((a, b) =>
        moodCounts[a] > moodCounts[b] ? a : b
      );

      // Calculate improvement trend
      const recentEntries = entries.slice(0, 7);
      const olderEntries = entries.slice(7, 14);

      let improvementTrend = "stable";
      if (recentEntries.length > 0 && olderEntries.length > 0) {
        const recentAvg =
          recentEntries.reduce((sum, entry) => sum + entry.value, 0) /
          recentEntries.length;
        const olderAvg =
          olderEntries.reduce((sum, entry) => sum + entry.value, 0) /
          olderEntries.length;

        if (recentAvg > olderAvg + 0.3) {
          improvementTrend = "improving";
        } else if (recentAvg < olderAvg - 0.3) {
          improvementTrend = "declining";
        }
      }

      return {
        currentStreak,
        longestStreak,
        averageWeekdayMood: Math.round(averageWeekdayMood * 10) / 10,
        averageWeekendMood: Math.round(averageWeekendMood * 10) / 10,
        mostCommonMood,
        improvementTrend,
      };
    } catch (error) {
      throw new Error("Failed to calculate mood insights");
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw new Error("Failed to sign out");
    }
  },
};

export default moodService;
