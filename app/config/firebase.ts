import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyANj1z8gyiXbHVVe9W8JwoFgEli3Nidc8w",
  authDomain: "gym-app-35f1f.firebaseapp.com",
  projectId: "gym-app-35f1f",
  storageBucket: "gym-app-35f1f.firebasestorage.app",
  messagingSenderId: "985065739003",
  appId: "1:985065739003:web:75fda36b4bdb27664bd65e",
  measurementId: "G-7SG442LM1X",
  databaseURL: "https://gym-app-35f1f-default-rtdb.firebaseio.com",
};

export const app = initializeApp(firebaseConfig); 