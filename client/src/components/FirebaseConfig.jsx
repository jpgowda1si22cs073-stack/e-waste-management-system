import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkj-4i8XzxJGcfWyXw1Fk71zvQERFou5s",
  authDomain: "e-waste-cloned.firebaseapp.com",
  projectId: "e-waste-cloned",
  storageBucket: "e-waste-cloned.firebasestorage.app",
  messagingSenderId: "342410012827",
  appId: "1:342410012827:web:f60850ea21748cc6f6be3e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);