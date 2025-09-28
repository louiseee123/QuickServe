// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDL-LhXtQY_I1nsErM15qrAtEIgJjFyDDA",
  authDomain: "quickserve-capstone.firebaseapp.com",
  projectId: "quickserve-capstone",
  storageBucket: "quickserve-capstone.appspot.com",
  messagingSenderId: "1029131144860",
  appId: "1:1029131144860:web:933116ad4604f324a1a759"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
