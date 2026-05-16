import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIlWM-SYPkW-ZvORYAx3Ey3IStyXafDFw",
  authDomain: "innoweb-7720f.firebaseapp.com",
  projectId: "innoweb-7720f",
  storageBucket: "innoweb-7720f.firebasestorage.app",
  messagingSenderId: "1044942976935",
  appId: "1:1044942976935:web:3266cfbf9dadf913fde882",
  measurementId: "G-BBSRY02GLF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
