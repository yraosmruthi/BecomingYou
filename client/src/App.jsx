import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React, { useState } from "react";
import { useTheme } from "./Context/ThemeContext";

import { ThemeProvider } from "./Context/ThemeContext";
import Navbar from "./components/Nav-Component/Navbar";
import HomePage from "./Pages/HomePage";
import AuthPage from "./Pages/AuthPage";
import ProfileDashboard from "./pages/ProfileDashboard";
import ChatPage from "./pages/ChatPage";
import GoalsPage from "./pages/GoalsPage";

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
   
              
        <AppContent user={user} onLogout={handleLogout} onLogin={handleLogin} />
      
   
  );
};

const AppContent = ({ user, onLogout, onLogin }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"
      }`}
    >
      <Navbar user={user} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage onLogin={onLogin} />} />
        <Route path="/profile" element={<ProfileDashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
