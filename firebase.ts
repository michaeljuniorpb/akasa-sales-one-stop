// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Firebase configuration (AMAN untuk frontend)
const firebaseConfig = {
  apiKey: "AIzaSyDZCOIDyRMlfthK366ygHtI5HwyfHqo-jQ",
  authDomain: "akasa-pure-living.firebaseapp.com",
  projectId: "akasa-pure-living",
  storageBucket: "akasa-pure-living.appspot.com",
  messagingSenderId: "331542244876",
  appId: "1:331542244876:web:13c3391f8ea7a979590829",
  measurementId: "G-6LB0J78XY7",
};

// ✅ Initialize Firebase (SAFE – hanya sekali)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🔥 Services
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Helper untuk UI status
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
