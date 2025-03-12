import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjTRSmBaJAwBfTGOLIXGajWwHdragOF4s",
  authDomain: "nursing-home-ebd3b.firebaseapp.com",
  projectId: "nursing-home-ebd3b",
  storageBucket: "nursing-home-ebd3b.appspot.com",
  messagingSenderId: "515586905994",
  appId: "1:515586905994:web:6b9d6542e65a077ff21a73",
  measurementId: "G-W2L7ZG9LJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
