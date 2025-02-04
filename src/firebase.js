import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDTM4JH6s3RW_V0GM5Ok2q8L5koCMTTZE",
  authDomain: "kaiyouren-e6c9c.firebaseapp.com",
  projectId: "kaiyouren-e6c9c",
  storageBucket: "kaiyouren-e6c9c.firebasestorage.app",
  messagingSenderId: "423497983699",
  appId: "1:423497983699:web:569da3ac4bb6fe9a9bd626",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
