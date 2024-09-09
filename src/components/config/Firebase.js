import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqIEurxP3oiFUSVPj7gJjZaXPTyI88gB0",
  authDomain: "calendar-6fe71.firebaseapp.com",
  projectId: "calendar-6fe71",
  storageBucket: "calendar-6fe71.appspot.com",
  messagingSenderId: "460054386293",
  appId: "1:460054386293:web:a55c8680b1a3c41ecc4a3c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };