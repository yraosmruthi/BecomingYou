import { motion, AnimatePresence } from "framer-motion";
import {
  Target, 
} from "lucide-react";

import Card from "../Utility-Component/Card";

const GoalProgress = ({ goals }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
      <Target className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
      Goal Progress
    </h3>
    <div className="space-y-4">
      {goals.slice(0, 3).map((goal) => (
        <div key={goal.id}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {goal.title}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {goal.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export default GoalProgress;
