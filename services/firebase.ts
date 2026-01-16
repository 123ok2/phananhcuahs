
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFHhS20-t1Cphnh9Oy05CygY1YNPe_sGY",
  authDomain: "phananhsuco.firebaseapp.com",
  projectId: "phananhsuco",
  storageBucket: "phananhsuco.firebasestorage.app",
  messagingSenderId: "1078709628180",
  appId: "1:1078709628180:web:9cd18cad968b679a8ba601",
  measurementId: "G-5568TW2LY5"
};

const app = initializeApp(firebaseConfig);
// Standard modular export for Firebase Auth in Web SDK v9+
export const auth = getAuth(app);
export const db = getFirestore(app);
