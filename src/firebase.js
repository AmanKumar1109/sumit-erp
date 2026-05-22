// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqxVQiC7z56YF98ChqoiAAlF5gN6sh1ZU",
  authDomain: "sumiterp-b5871.firebaseapp.com",
  projectId: "sumiterp-b5871",
  storageBucket: "sumiterp-b5871.firebasestorage.app",
  messagingSenderId: "143214189235",
  appId: "1:143214189235:web:e51c88b9969bb8cb9deec6",
  measurementId: "G-NRSX1HQ173"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };