import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBp_H_dxgmNe4iY1RNeI4tjJc-k4okJfQk",
  authDomain: "visal-ba17e.firebaseapp.com",
  projectId: "visal-ba17e",
  storageBucket: "visal-ba17e.firebasestorage.app",
  messagingSenderId: "963433404897",
  appId: "1:963433404897:web:ae950b3a05ce77c43cdaa0",
  measurementId: "G-QC5KGMND9M"
};

// Defensive App Initialization
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Defensive Auth Initialization (Ensures only one instance)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  // If already initialized, just get the existing instance
  auth = getAuth(app);
}

let db;
try {
  db = initializeFirestore(app, {});
} catch (e) {
  db = getFirestore(app);
}
const storage = getStorage(app);

export { auth, db, storage };
