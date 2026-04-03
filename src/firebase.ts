import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. Try to load the local configuration file (AI Studio context)
// We use a dynamic import to avoid build errors if the file is missing on Vercel.
let firebaseConfig: any = null;

try {
  // @ts-ignore
  const localConfig = await import(/* @vite-ignore */ '../firebase-applet-config.json');
  const config = localConfig.default || localConfig;
  if (config && config.apiKey && config.apiKey.trim() !== "") {
    firebaseConfig = config;
  }
} catch (e) {
  console.warn('Local Firebase config not found or invalid, checking environment variables.');
}

// 2. If local config is missing or incomplete, use environment variables (Vercel context)
if (!firebaseConfig || !firebaseConfig.apiKey) {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID
  };
  
  if (envConfig.apiKey && envConfig.apiKey.trim() !== "" && envConfig.apiKey !== "undefined") {
    firebaseConfig = envConfig;
  }
}

// 3. Final check and initialization
if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined' || firebaseConfig.apiKey.trim() === "") {
  console.error('CRITICAL ERROR: Firebase API Key is missing or invalid. Authentication and Firestore will fail.');
  // We still try to initialize to prevent total crash, but it will likely error out on first use
  firebaseConfig = firebaseConfig || { apiKey: "MISSING_API_KEY" };
}

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID if available
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
