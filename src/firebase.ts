// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_APP_FIREBASE_API_KEY as string,
  authDomain: process.env.VITE_APP_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.VITE_APP_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.VITE_APP_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env
    .VITE_APP_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.VITE_APP_FIREBASE_APP_ID as string,
  measurementId: process.env.VITE_APP_FIREBASE_MEASUREMENT_ID as string,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
