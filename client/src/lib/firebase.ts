import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "quickserve-capstone",
  "appId": "1:1029131144860:web:933116ad4604f324a1a759",
  "storageBucket": "quickserve-capstone.appspot.com",
  "apiKey": "AIzaSyDL-LhXtQY_I1nsErM15qrAtEIgJjFyDDA",
  "authDomain": "localhost", // Changed for local development
  "messagingSenderId": "1029131144860"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
