import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Activity,
  Info,
} from "lucide-react";
import Card from "../Utility-Component/Card";
import Button from "../Utility-Component/Button";

const MoodChart = ({ moodData, userId }) => {
  const [chartData, setChartData] = useState([]);
  const [viewMode, setViewMode] = useState("7days"); // '7days', '30days', 'all'
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [moodStats, setMoodStats] = useState({
    averageMood: 0,
    trend: "stable",
    totalEntries: 0,
    bestDay: null,
    worstDay: null,
  });

  useEffect(() => {
    if (moodData && moodData.length > 0) {
      processChartData();
      calculateMoodStats();
    }
  }, [moodData, viewMode]);

  const processChartData = () => {
    let data = [...moodData];

    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Filter based on view mode
    if (viewMode === "7days") {
      data = data.slice(-7);
    } else if (viewMode === "30days") {
      data = data.slice(-30);
    }

    setChartData(data);
  };

  const calculateMoodStats = () => {
    if (!moodData || moodData.length === 0) return;

    const total = moodData.reduce((sum, entry) => sum + entry.mood, 0);
    const average = moodData.length > 0 ? total / moodData.length : 0;


    // Find best and worst days
    const bestDay = moodData.reduce((best, current) =>
      current.mood > best.mood ? current : best
    );
    const worstDay = moodData.reduce((worst, current) =>
      current.mood < worst.mood ? current : worst
    );

    // Calculate trend (last 7 days vs previous 7 days)
    const recent7 = moodData.slice(-7);
    const previous7 = moodData.slice(-14, -7);

    let trend = "stable";
    if (recent7.length > 0 && previous7.length > 0) {
      const recentAvg =
        recent7.reduce((sum, entry) => sum + entry.mood, 0) / recent7.length;
      const previousAvg =
        previous7.reduce((sum, entry) => sum + entry.mood, 0) /
        previous7.length;

      if (recentAvg > previousAvg + 0.3) trend = "improving";
      else if (recentAvg < previousAvg - 0.3) trend = "declining";
    }

    setMoodStats({
      averageMood: isNaN(average) ? 0 : Math.round(average * 10) / 10,
      trend,
      totalEntries: moodData.length,
      bestDay,
      worstDay,
    });
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

  const getMoodColor = (mood) => {
    const colors = {
      5: "from-green-400 to-green-600",
      4: "from-blue-400 to-blue-600",
      3: "from-yellow-400 to-yellow-600",
      2: "from-orange-400 to-orange-600",
      1: "from-red-400 to-red-600",
    };
    return colors[mood] || "from-gray-400 to-gray-600";
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTrendIcon = () => {
    switch (moodStats.trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    switch (moodStats.trend) {
      case "improving":
        return "Improving";
      case "declining":
        return "Needs attention";
      default:
        return "Stable";
    }
  };

  const getTrendColor = () => {
    switch (moodStats.trend) {
      case "improving":
        return "text-green-600 dark:text-green-400";
      case "declining":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center text-gray-800 dark:text-white">
          <BarChart3 className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
          Mood Trend
        </h3>

        <div className="flex items-center space-x-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="p-2"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mood Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {moodStats.averageMood}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Average Mood
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {getTrendText()}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Trend</div>
        </div>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {moodStats.totalEntries}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total Entries
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="h-40 flex items-end justify-between space-x-1 mb-4">
          {chartData.map((data, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(data.mood / 5) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 flex flex-col items-center cursor-pointer group"
              onClick={() => setSelectedDataPoint(data)}
            >
              <div
                className={`w-full bg-gradient-to-t ${getMoodColor(
                  data.mood
                )} rounded-t-lg transition-all duration-300 group-hover:opacity-80 relative`}
                style={{
                  height: `${(data.mood / 5) * 100}%`,
                  minHeight: "8px",
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs px-2 py-1 rounded whitespace-nowrap">
                    {getMoodEmoji(data.mood)} {getMoodLabel(data.mood)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {formatDate(data.date)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mood Scale */}
        <div className="absolute left-0 top-0 h-40 flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500 -ml-6">
          <span>😊 5</span>
          <span>🙂 4</span>
          <span>😐 3</span>
          <span>🙁 2</span>
          <span>😢 1</span>
        </div>
      </div>

      {/* Detailed Stats */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-white">
              Detailed Statistics
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {moodStats.bestDay && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Best Day
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getMoodEmoji(moodStats.bestDay.mood)}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {formatDate(moodStats.bestDay.date)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getMoodLabel(moodStats.bestDay.mood)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {moodStats.worstDay && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Challenging Day
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getMoodEmoji(moodStats.worstDay.mood)}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {formatDate(moodStats.worstDay.date)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getMoodLabel(moodStats.worstDay.mood)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Data Point Modal */}
      <AnimatePresence>
        {selectedDataPoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedDataPoint(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">
                  {getMoodEmoji(selectedDataPoint.mood)}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {getMoodLabel(selectedDataPoint.mood)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(selectedDataPoint.date)}
                </p>
              </div>

              {selectedDataPoint.note && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedDataPoint.note}
                  </p>
                </div>
              )}

              <Button
                onClick={() => setSelectedDataPoint(null)}
                className="w-full"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default MoodChart;
