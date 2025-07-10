import { motion } from "framer-motion";
import { Target, CheckCircle, Clock, Trash2, Edit3 } from "lucide-react";

import Button from "../Utility-Component/Button";
import Card from "../Utility-Component/Card";

const GoalCard = ({ goal, onUpdate, onDelete }) => {
  const progressColor =
    goal.progress >= 75
      ? "from-green-500 to-emerald-500"
      : goal.progress >= 50
      ? "from-blue-500 to-purple-500"
      : "from-orange-500 to-red-500";

  // Calculate days left using the backend data or compute it
  const daysLeft =
    goal.daysLeft ||
    Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

  const isOverdue = goal.isOverdue || (daysLeft < 0 && !goal.completed);

  const handleProgressUpdate = (increment) => {
    const newProgress = Math.min(100, Math.max(0, goal.progress + increment));
    onUpdate(goal._id, { progress: newProgress });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      onDelete(goal._id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
            {goal.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {goal.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span className={isOverdue ? "text-red-500" : ""}>
                {isOverdue
                  ? "Overdue"
                  : daysLeft > 0
                  ? `${daysLeft} days left`
                  : "Due today"}
              </span>
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              <span className="capitalize">{goal.type}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Target: {formatDate(goal.targetDate)}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleProgressUpdate(-10)}
              disabled={goal.progress <= 0}
              title="Decrease progress by 10%"
            >
              -10%
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleProgressUpdate(10)}
              disabled={goal.progress >= 100}
              title="Increase progress by 10%"
            >
              +10%
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
            title="Delete goal"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {goal.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            className={`bg-gradient-to-r ${progressColor} h-3 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center space-x-2 mb-3">
        {goal.completed && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        )}
        {!goal.isActive && !goal.completed && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Inactive
          </span>
        )}
        {isOverdue && !goal.completed && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Overdue
          </span>
        )}
      </div>

      {/* Completion celebration */}
      {goal.progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg"
        >
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
          <span className="text-green-700 dark:text-green-300 font-medium">
            Goal Completed! 🎉
          </span>
        </motion.div>
      )}

      {/* Quick progress buttons for mobile */}
      <div className="flex space-x-2 mt-4 md:hidden">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleProgressUpdate(25)}
          disabled={goal.progress >= 100}
          className="flex-1"
        >
          +25%
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleProgressUpdate(50)}
          disabled={goal.progress >= 100}
          className="flex-1"
        >
          +50%
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdate(goal._id, { progress: 100 })}
          disabled={goal.progress >= 100}
          className="flex-1"
        >
          Complete
        </Button>
      </div>
    </Card>
  );
};

export default GoalCard;
