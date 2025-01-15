// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,  // Importing signOut from firebase/auth
} from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDwI--IvlQDSUxq_Gk3E07OVTAp1cdIfVU",
  authDomain: "fir-ex1-44de5.firebaseapp.com",
  projectId: "fir-ex1-44de5",
  storageBucket: "fir-ex1-44de5.appspot.com",
  messagingSenderId: "229131589170",
  appId: "1:229131589170:web:4765808b95ee000bdfce2b",
  measurementId: "G-RZD4ZJ6XRM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export everything you'll need
export { auth, createUserWithEmailAndPassword, db, setDoc, doc, GoogleAuthProvider, signInWithPopup, signOut }; 
