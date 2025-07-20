import React, { useState, useEffect } from "react";
import Button from "../components/Utility-Component/Button";
import Card from "../components/Utility-Component/Card";
import GoalCard from "../components/Goal-Component/GoalCard";
import NewGoalModal from "../components/Goal-Component/NewGoalModal";
import goalService from "../services/goalService";
import { Target, Plus, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../Context/Auth-context";

const GoalsPage = () => {
  const { user } = useAuth(); // Get user from Auth context
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    averageProgress: 0,
  });

  // Replace with actual user ID - you might get this from auth context
  const userId = user.uid; // This should come from your authentication system

  // Fetch goals from API
  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const goalsData = await goalService.getGoals(userId, filter);
      setGoals(goalsData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching goals:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch goal statistics
  const fetchStats = async () => {
    try {
      const statsData = await goalService.getGoalStats(userId);
      setStats(statsData);
    } catch (err) {
      Toast.error("Failed to fetch goal statistics");
      console.error("Error fetching stats:", err);
    }
  };

  // Load goals and stats on component mount and when filter changes
  useEffect(() => {
    fetchGoals();
  }, [filter]);

  useEffect(() => {
    fetchStats();
  }, [goals]); // Refetch stats when goals change

  // Filter goals locally (in addition to server-side filtering)
  const filteredGoals = goals.filter((goal) => {
    if (filter === "all") return true;
    if (filter === "active") return goal.isActive;
    if (filter === "completed") return goal.completed;
    return goal.type === filter;
  });

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      // Optimistically update the UI
      setGoals((prev) =>
        prev.map((goal) =>
          goal._id === goalId ? { ...goal, ...updates } : goal
        )
      );

      // If it's a progress update, use the specific progress endpoint
      if (updates.progress !== undefined && Object.keys(updates).length === 1) {
        await goalService.updateProgress(goalId, updates.progress);
      } else {
        await goalService.updateGoal(goalId, updates);
      }

      // Refetch to ensure consistency
      fetchGoals();
    } catch (err) {
      setError(err.message);
      // Revert optimistic update on error
      fetchGoals();
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      // Optimistically update the UI
      setGoals((prev) => prev.filter((goal) => goal._id !== goalId));

      await goalService.deleteGoal(goalId);

      // Refetch to ensure consistency
      fetchGoals();
    } catch (err) {
      setError(err.message);
      // Revert optimistic update on error
      fetchGoals();
    }
  };

  const handleCreateGoal = async (newGoalData) => {
    try {
      const goalData = {
        ...newGoalData,
        userId: userId,
      };

      const createdGoal = await goalService.createGoal(goalData);

      // Add the new goal to the list
      setGoals((prev) => [createdGoal, ...prev]);

      // Refetch to ensure consistency
      fetchGoals();
    } catch (err) {
      setError(err.message);
      console.error("Error creating goal:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading your goals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-200">Your Goals</h1>
          <p className="text-gray-500">
            Track your progress and achieve your dreams
          </p>
        </div>
        <Button onClick={() => setShowNewGoal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto"
          >
            ×
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.totalGoals}
          </div>
          <div className="text-gray-600">Total Goals</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.completedGoals}
          </div>
          <div className="text-gray-600">Completed</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(stats.averageProgress || 0)}%
          </div>
          <div className="text-gray-600">Average Progress</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6">
        {["all", "active", "completed", "short-term", "long-term"].map(
          (filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "primary" : "ghost"}
              onClick={() => setFilter(filterType)}
            >
              {filterType === "all"
                ? "All Goals"
                : filterType === "short-term"
                ? "Short-term"
                : filterType === "long-term"
                ? "Long-term"
                : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          )
        )}
      </div>

      {/* Goals Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => (
          <GoalCard
            key={goal._id}
            goal={goal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2 text-gray-600">
            No goals found
          </h3>
          <p className="mb-4 text-gray-500">
            {filter === "all"
              ? "Start by creating your first goal!"
              : `No ${filter} goals found. Try a different filter or create a new goal.`}
          </p>
          <Button onClick={() => setShowNewGoal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Create Goal
          </Button>
        </div>
      )}

      <NewGoalModal
        isOpen={showNewGoal}
        onClose={() => setShowNewGoal(false)}
        onSubmit={handleCreateGoal}
      />
    </div>
  );
};

export default GoalsPage;
