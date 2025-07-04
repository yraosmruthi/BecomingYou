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


const Card = ({ children, className = "", hover = true, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={hover ? { y: -5, scale: 1.02 } : {}}
    className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export default Card;
