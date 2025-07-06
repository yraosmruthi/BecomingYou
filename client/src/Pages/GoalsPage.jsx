import React, { useState } from "react";
import Button from "../components/Utility-Component/Button";
import Card from "../components/Utility-Component/Card";
import GoalCard from "../components/Goal-Component/GoalCard";
import NewGoalModal from "../components/Goal-Component/NewGoalModal";
import {
  Target, 
  Plus,
} from "lucide-react";


const GoalsPage = () => {
  
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Daily Meditation",
      description:
        "Meditate for at least 10 minutes every day to improve mindfulness and reduce stress.",
      type: "short-term",
      progress: 75,
      targetDate: "2025-08-01",
      createdAt: "2025-06-01",
    },
    {
      id: 2,
      title: "Exercise Regularly",
      description:
        "Go to the gym or do home workouts 3 times per week to improve physical health.",
      type: "short-term",
      progress: 60,
      targetDate: "2025-07-15",
      createdAt: "2025-06-01",
    },
    {
      id: 3,
      title: "Read More Books",
      description:
        "Read 12 books this year to expand knowledge and improve focus.",
      type: "long-term",
      progress: 40,
      targetDate: "2025-12-31",
      createdAt: "2025-01-01",
    },
  ]);

  const [showNewGoal, setShowNewGoal] = useState(false);
  const [filter, setFilter] = useState("all");

  const filteredGoals = goals.filter(
    (goal) => filter === "all" || goal.type === filter
  );

  const handleUpdateGoal = (goalId, updates) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal))
    );
  };

  const handleDeleteGoal = (goalId) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  const handleCreateGoal = (newGoal) => {
    setGoals((prev) => [...prev, newGoal]);
  };

  const completedGoals = goals.filter((goal) => goal.progress === 100).length;
  const averageProgress =
    goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-2 
               text-gray-200"
          >
            Your Goals
          </h1>
          <p className="text-gray-500">
            Track your progress and achieve your dreams
          </p>
        </div>
        <Button onClick={() => setShowNewGoal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {goals.length}
          </div>
          <div className= "text-gray-600">
            Total Goals
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {completedGoals}
          </div>
          <div className= "text-gray-600">
            Completed
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(averageProgress)}%
          </div>
          <div className= "text-gray-600">
            Average Progress
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6">
        {["all", "short-term", "long-term"].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? "primary" : "ghost"}
            onClick={() => setFilter(filterType)}
          >
            {filterType === "all"
              ? "All Goals"
              : filterType === "short-term"
              ? "Short-term"
              : "Long-term"}
          </Button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
          />
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <Target
            className={`h-16 w-16 mx-auto mb-4 ${
              isDarkMode ? "text-gray-600" : "text-gray-300"
            }`}
          />
          <h3
            className={`text-lg font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            No goals found
          </h3>
          <p
            className={`mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Start by creating your first goal!
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
