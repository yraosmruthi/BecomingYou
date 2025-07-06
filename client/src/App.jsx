import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React, { useState } from "react";
import Navbar from "./components/Nav-Component/Navbar";
import HomePage from "./Pages/HomePage";
import AuthPage from "./Pages/AuthPage";
import ProfileDashboard from "./pages/ProfileDashboard";
import ChatPage from "./pages/ChatPage";
import GoalsPage from "./pages/GoalsPage";
import { Toaster } from "react-hot-toast";

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

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="min-h-screen transition-colors bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
    </>
  );
};

export default App;
