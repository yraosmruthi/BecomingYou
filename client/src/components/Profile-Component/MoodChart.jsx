import {
  TrendingUp,
} from "lucide-react";

import Card from "../Utility-Component/Card";

 const MoodChart = ({ moodData }) => {
    const chartData = moodData.slice(-7); // Last 7 days
  
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
          Mood Trend (Last 7 Days)
        </h3>
        <div className="h-32 flex items-end justify-between space-x-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${(data.mood / 5) * 100}%` }}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {new Date(data.date).getDate()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  export default MoodChart