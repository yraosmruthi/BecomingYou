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

const FeaturesSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "AI Chatbot Support",
      description:
        "Talk to our empathetic AI companion whenever you need support",
    },
    {
      icon: Calendar,
      title: "Daily Mood Quiz",
      description:
        "Track your emotional wellbeing with personalized daily check-ins",
    },
    {
      icon: TrendingUp,
      title: "Mood Tracking",
      description:
        "Visualize your emotional journey with beautiful charts and insights",
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set and achieve meaningful short-term and long-term goals",
    },
    {
      icon: BarChart3,
      title: "Personalized Insights",
      description: "Get tailored recommendations based on your mood patterns",
    },
    {
      icon: Award,
      title: "Progress Celebration",
      description: "Celebrate your achievements and milestones along the way",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Features to Support Your Journey
          </h2>
          <p className="text-lg text-gray-600">
            Comprehensive tools designed with your mental health in mind
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full">
                <feature.icon className="h-12 w-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


export default FeaturesSection;
