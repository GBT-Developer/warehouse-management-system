// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: window.process.env.FIREBASE_API_KEY,
  authDomain: window.process.env.FIREBASE_AUTH_DOMAIN,
  projectId: window.process.env.FIREBASE_PROJECT_ID,
  storageBucket: window.process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: window.process.env.FIREBASE_APP_ID,
  measurementId: window.process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
