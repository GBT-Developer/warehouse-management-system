// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';

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
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'asia-southeast2');
export const callable = (name: string) => httpsCallable(functions, name);

if (window.process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectAuthEmulator(secondaryAuth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
