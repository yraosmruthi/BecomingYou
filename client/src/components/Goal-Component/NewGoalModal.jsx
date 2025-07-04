import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  TrendingUp,
  Target,
  Calendar,
  User,
  Menu,
  X,
  Send,
  Star,
  CheckCircle,
  Plus,
  BarChart3,
  Home,
  LogOut,
  Eye,
  EyeOff,
  Smile,
  Meh,
  Frown,
  ArrowRight,
  Award,
  Clock,
  Moon,
  Sun,
  Trophy,
  Edit,
  Trash2,
} from "lucide-react";


import Button from "../Utility-Component/Button";
import Card from "../Utility-Component/Card";
import Modal from "../Utility-Component/Modal";
import Input from "../Utility-Component/Input";

const NewGoalModal = ({ isOpen, onClose, onSubmit }) => {
  const [goalData, setGoalData] = useState({
    title: "",
    description: "",
    type: "short-term",
    targetDate: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goalData.title && goalData.description && goalData.targetDate) {
      onSubmit({
        ...goalData,
        id: Date.now(),
        progress: 0,
        createdAt: new Date().toISOString(),
      });
      onClose();
      setGoalData({
        title: "",
        description: "",
        type: "short-term",
        targetDate: "",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Goal">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Goal Title"
          value={goalData.title}
          onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
          placeholder="e.g., Exercise 3 times per week"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={goalData.description}
            onChange={(e) =>
              setGoalData({ ...goalData, description: e.target.value })
            }
            placeholder="Describe your goal in detail..."
            className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl resize-none h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Goal Type
          </label>
          <select
            value={goalData.type}
            onChange={(e) => setGoalData({ ...goalData, type: e.target.value })}
            className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="short-term">Short-term (1-3 months)</option>
            <option value="long-term">Long-term (3+ months)</option>
          </select>
        </div>

        <Input
          label="Target Date"
          type="date"
          value={goalData.targetDate}
          onChange={(e) =>
            setGoalData({ ...goalData, targetDate: e.target.value })
          }
          min={new Date().toISOString().split("T")[0]}
          required
        />

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewGoalModal;
