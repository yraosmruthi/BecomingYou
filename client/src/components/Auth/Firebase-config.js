import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsanVcF1-Qbv2thhyJxFpC2Q_iMq_Z8mk",
  authDomain: "becomingyou-5a09e.firebaseapp.com",
  projectId: "becomingyou-5a09e",
  storageBucket: "becomingyou-5a09e.firebasestorage.app",
  messagingSenderId: "529637577521",
  appId: "1:529637577521:web:c5e2f959a33d4f947a5610",
  measurementId: "G-W8VDRE5X9H",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
