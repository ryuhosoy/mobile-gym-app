import { initializeApp } from "firebase/app";

console.log("firebaseConfig", process.env.EXPO_PUBLIC_FIREBASE_API_KEY!);

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: "gym-app-35f1f.firebaseapp.com",
  projectId: "gym-app-35f1f",
  storageBucket: "gym-app-35f1f.firebasestorage.app",
  messagingSenderId: "985065739003",
  appId: "1:985065739003:web:75fda36b4bdb27664bd65e",
  measurementId: "G-7SG442LM1X",
  databaseURL: "https://gym-app-35f1f-default-rtdb.firebaseio.com",
};

export const app = initializeApp(firebaseConfig); 