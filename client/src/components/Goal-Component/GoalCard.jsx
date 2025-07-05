import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  CheckCircle,
  Clock,
} from "lucide-react";

import Button from "../Utility-Component/Button";
import Card from "../Utility-Component/Card";

const GoalCard = ({ goal, onUpdate, onDelete }) => {
  const progressColor =
    goal.progress >= 75
      ? "from-green-500 to-emerald-500"
      : goal.progress >= 50
      ? "from-blue-500 to-purple-500"
      : "from-orange-500 to-red-500";

  const daysLeft = Math.ceil(
    (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="p-6">
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
              {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              {goal.type}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onUpdate(goal.id, { progress: Math.min(100, goal.progress + 10) })
            }
          >
            +10%
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
    </Card>
  );
};

export default GoalCard;
