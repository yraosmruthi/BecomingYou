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


const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "font-medium rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const variants = {
    primary:
      "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg",
    secondary:
      "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-gray-700 shadow-md",
    ghost:
      "bg-transparent text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
