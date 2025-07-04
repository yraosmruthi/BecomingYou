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


 const ThemeContext = createContext();

 const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or default to false
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

 const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export { ThemeProvider, useTheme };

// ==================== THEME PROVIDER ====================
// const ThemeContext = createContext();

// const ThemeProvider = ({ children }) => {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [isDarkMode]);

//   const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

//   return (
//     <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };
// ==================== THEME CONTEXT ====================
