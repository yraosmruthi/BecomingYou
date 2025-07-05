import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle,
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  Award,
} from "lucide-react";

import Card from "../Utility-Component/Card";

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
    <section className="py-20 px-4 bg-gray-50 text-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white dark:text-gray-200">
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
                <feature.icon className="h-12 w-12 text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-200">
                  {feature.title}
                </h3>
                <p className="text-gray-200">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


export default FeaturesSection;
