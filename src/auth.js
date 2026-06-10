import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db, isAdminEmail } from "./firebase";

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOut() {
  return firebaseSignOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Determina el rol del usuario: "admin", "user" (autorizado) o "none".
export async function resolveRole(user) {
  if (!user || !user.email) return "none";
  const email = user.email.toLowerCase();
  if (isAdminEmail(email)) return "admin";
  try {
    const snap = await getDoc(doc(db, "authorizedFeedbackUsers", email));
    if (snap.exists() && snap.data().active !== false) return "user";
  } catch (err) {
    console.error("Error verificando autorización:", err);
  }
  return "none";
}
