import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../Context/ThemeContext";
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

const AboutSection = () => (
  <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className=" text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-gray-200">
          About BecomingYou
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          BecomingYou is your compassionate AI companion designed to support you
          through life's challenges. We understand that mental health is a
          journey, not a destination. Our platform provides personalized
          support, mood tracking, and goal-setting tools to help you become the
          best version of yourself.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-center">
            <Heart className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Empathetic</h3>
            <p className="text-gray-600">
              Understanding and compassionate support when you need it most
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Goal-Oriented</h3>
            <p className="text-gray-600">
              Set and track meaningful goals for personal growth
            </p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Progress Tracking</h3>
            <p className="text-gray-600">
              Visualize your journey with detailed mood and progress analytics
            </p>
          </Card>
        </div>
      </motion.div>
    </div>
  </section>
);


export default AboutSection;
