'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== "undefined") {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
}

export { auth, db }; 