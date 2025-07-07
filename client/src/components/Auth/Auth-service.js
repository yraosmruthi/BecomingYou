import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged, // ✅ ← THIS IS MISSING
} from "firebase/auth";
import { auth, googleProvider } from "../Auth/Firebase-config";
class AuthService {
  constructor() {
    this.auth = auth;
    this.googleProvider = googleProvider;
  }

  // Get Firebase ID Token for backend verification
  async getIdToken() {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Send authenticated request to backend
  async sendAuthenticatedRequest(url, options = {}) {
    const idToken = await this.getIdToken();

    if (!idToken) {
      throw new Error("No authentication token available");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // Email/Password Sign Up
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: displayName,
      });

      // Send email verification
      await sendEmailVerification(user);

      // Get ID token for backend
      const idToken = await user.getIdToken();

      // Send user data to backend
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          displayName,
          email: user.email,
          uid: user.uid,
        }),
      });

      const backendResult = await response.json();

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          idToken,
        },
        backendData: backendResult,
        message:
          "Account created successfully! Please check your email to verify your account.",
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error),
      };
    }
  }

  // Email/Password Sign In
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get ID token for backend verification
      const idToken = await user.getIdToken();

      // Verify with backend and get user data
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const backendResult = await response.json();

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          idToken,
        },
        backendData: backendResult,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error),
      };
    }
  }

  // Google Sign In
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;

      // Get ID token for backend verification
      const idToken = await user.getIdToken();

      // Send to backend
      const response = await fetch("http://localhost:3000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          isNewUser: result._tokenResponse?.isNewUser || false,
        }),
      });

      const backendResult = await response.json();

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          idToken,
        },
        backendData: backendResult,
        isNewUser: result._tokenResponse?.isNewUser || false,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error),
      };
    }
  }

  // Sign Out
  async signOut() {
    try {
      await signOut(this.auth);
      return {
        success: true,
        message: "Signed out successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error),
      };
    }
  }

  // Password Reset
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error),
      };
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  handleAuthError(error) {
    const errorMessages = {
      "auth/user-not-found": "No account found with this email address.",
      "auth/wrong-password": "Incorrect password.",
      "auth/invalid-email": "Invalid email address.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password should be at least 6 characters long.",
      "auth/network-request-failed":
        "Network error. Please check your connection.",
      "auth/too-many-requests":
        "Too many failed attempts. Please try again later.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/popup-closed-by-user":
        "Sign-in popup was closed before completing.",
      "auth/popup-blocked": "Sign-in popup was blocked by your browser.",
      "auth/cancelled-popup-request": "Sign-in was cancelled.",
      "auth/invalid-credential": "Invalid credentials provided.",
      "auth/operation-not-allowed": "This sign-in method is not enabled.",
      "auth/account-exists-with-different-credential":
        "An account already exists with the same email but different sign-in credentials.",
    };

    return (
      errorMessages[error.code] ||
      error.message ||
      "An unexpected error occurred."
    );
  }
}

export const authService = new AuthService();
