import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBELYb-c80DbKjPN-a5-FQhoBoFje1Pyl4",
  authDomain: "e-waste-management-bc6f0.firebaseapp.com",
  projectId: "e-waste-management-bc6f0",
  storageBucket: "e-waste-management-bc6f0.firebasestorage.app",
  messagingSenderId: "490912428105",
  appId: "1:490912428105:web:f7b819a257f2d27eb70f98",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
