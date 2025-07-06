import React, { createContext, useContext, useState, useEffect } from "react";
import {authService} from "../components/Auth/Auth-service"
import { useNavigate,useLocation } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn = !!user

  useEffect(() => {
    if (!loading && !isLoggedIn && location.pathname !== "/auth") {
      navigate("/auth");
    }
  }, [loading, isLoggedIn, location.pathname, navigate]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        
        const idToken = await firebaseUser.getIdToken();
        try {
          const response = await fetch("/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (response.ok) {
            const backendData = await response.json();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              idToken,
              ...backendData,
            });
          }
        } catch (error) {
          console.error("Error syncing with backend:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            idToken,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, displayName) => {
    setLoading(true);
    setError(null);

    const result = await authService.signUp(email, password, displayName);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    if (result.success) {
      // Redirect to the home page after successful sign-up
      navigate("/profile");
    }
    return result;
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);

    const result = await authService.signIn(email, password);
    if (result.success) {
      // Redirect to the home page after successful sign-in
      navigate("/profile");
    }
    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    const result = await authService.signInWithGoogle();
    if (result.success) {
      // Redirect to the home page after successful sign-in
      navigate("/profile");
    }
    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    const result = await authService.signOut();
    if (result.success) {
      // Redirect to the login page after successful sign-out
      navigate("/auth");
    }
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
    return result;
  };

  const resetPassword = async (email) => {
    setError(null);
    return await authService.resetPassword(email);
  };

  // Helper function to make authenticated API calls
  const apiCall = async (url, options = {}) => {
    if (!user?.idToken) {
      throw new Error("No authentication token available");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.idToken}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    apiCall,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthProvider;