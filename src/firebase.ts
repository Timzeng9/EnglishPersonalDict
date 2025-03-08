// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBucDi4QuIDubWIbyvyOQuYr0W_zBMCxWU",
  authDomain: "learningassist-60e5b.firebaseapp.com",
  databaseURL: "https://learningassist-60e5b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "learningassist-60e5b",
  storageBucket: "learningassist-60e5b.firebasestorage.app",
  messagingSenderId: "325077297191",
  appId: "1:325077297191:web:a8231802133850b2404602",
  measurementId: "G-R9SZZBB87L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app); 
export const db = getDatabase(app);