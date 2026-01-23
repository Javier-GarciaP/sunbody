
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC8AbImdum5gjWjy1b2tDKTg4otq8ZeEpo",
    authDomain: "sunbody-1f7f3.firebaseapp.com",
    projectId: "sunbody-1f7f3",
    storageBucket: "sunbody-1f7f3.firebasestorage.app",
    messagingSenderId: "263353233276",
    appId: "1:263353233276:web:a5b78e556d0dc747f9fef9",
    measurementId: "G-L2RB4VTH66"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
