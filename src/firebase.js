// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu6-3yIP043AEnvd2ujOHxMTpYDjZsep4",
  authDomain: "modelo-receita.firebaseapp.com",
  projectId: "modelo-receita",
  storageBucket: "modelo-receita.firebasestorage.app",
  messagingSenderId: "147069543887",
  appId: "1:147069543887:web:95d8c0ae87a4e064725eba",
  measurementId: "G-7VK7R196ZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
