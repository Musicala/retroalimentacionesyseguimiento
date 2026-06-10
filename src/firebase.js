import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBld9AaA4OyRxB_NV7ZPpqJXoMkzJYcdgo",
  authDomain: "reuniones-de-seguimiento-adm.firebaseapp.com",
  projectId: "reuniones-de-seguimiento-adm",
  storageBucket: "reuniones-de-seguimiento-adm.firebasestorage.app",
  messagingSenderId: "323361775727",
  appId: "1:323361775727:web:eb9c382723305d78822d9a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Correos de administradores. Las reglas de Firestore son la verdadera
// barrera de seguridad; esta lista solo controla la interfaz.
export const ADMIN_EMAILS = [
  "alekcaballeromusic@gmail.com",
  "catalina.medina.leal@gmail.com",
];

export const isAdminEmail = (email) =>
  ADMIN_EMAILS.includes((email || "").toLowerCase());
