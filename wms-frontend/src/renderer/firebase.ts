// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: window.process.env.FIREBASE_API_KEY,
  authDomain: window.process.env.FIREBASE_AUTH_DOMAIN,
  projectId: window.process.env.FIREBASE_PROJECT_ID,
  storageBucket: window.process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: window.process.env.FIREBASE_APP_ID,
};

const stagingFirebaseConfig = {
  apiKey: window.process.env.STAGING_FIREBASE_API_KEY,
  authDomain: window.process.env.STAGING_FIREBASE_AUTH_DOMAIN,
  projectId: window.process.env.STAGING_FIREBASE_PROJECT_ID,
  storageBucket: window.process.env.STAGING_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.process.env.STAGING_FIREBASE_MESSAGING_SENDER_ID,
  appId: window.process.env.STAGING_FIREBASE_APP_ID,
  measurementId: window.process.env.STAGING_FIREBASE_MEASUREMENT_ID,
};

const isDevelopmentMode = window.process.env.NODE_ENV === 'development';

// Initialize Firebase
export const app = initializeApp(
  isDevelopmentMode ? stagingFirebaseConfig : firebaseConfig
);
export const auth = getAuth(app);
const secondaryApp = initializeApp(
  isDevelopmentMode ? stagingFirebaseConfig : firebaseConfig,
  'Secondary'
);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (window.process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectAuthEmulator(secondaryAuth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
}
