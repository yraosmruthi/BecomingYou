import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../Utility-Component/Button";
import Card from "../Utility-Component/Card";
import Modal from "../Utility-Component/Modal";
import Input from "../Utility-Component/Input";
import ThemeToggle from "../Theme-Component/ThemeToggle";
import { useTheme } from "../../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
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

const Navbar = ({ currentRoute, navigate, user, onLogout }) => {
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  

  const navItems = user
    ? [
        { path: "/profile", label: "Dashboard", icon: Home },
        { path: "/chat", label: "Chat", icon: MessageCircle },
        { path: "/goals", label: "Goals", icon: Target },
      ]
    : [
        { path: "/", label: "Home", icon: Home },
        { path: "/auth", label: "Login", icon: User },
      ];

  return (
    <nav
      className={`backdrop-blur-lg shadow-sm border-b sticky top-0 z-50 transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 border-gray-800/30"
          : "bg-gradient-to-br from-white/95 via-white/98 to-white/95 border-gray-200/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }}
          >
            <Heart className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              BecomingYou
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={currentRoute === item.path ? "primary" : "ghost"}
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
            <ThemeToggle />
            {user && (
              <Button
                variant="ghost"
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 space-y-2"
            >
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={currentRoute === item.path ? "primary" : "ghost"}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
              {user && (
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
export default Navbar;