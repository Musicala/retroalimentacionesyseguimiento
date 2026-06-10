import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/* ---------- Valores por defecto de configuración ---------- */

export const DEFAULT_FIELDS = {
  types: [
    "Actitud",
    "Cumplimiento",
    "Comunicación",
    "Pedagogía",
    "Puntualidad",
    "Convivencia",
    "Situación sensible",
    "Otro",
  ],
  urgencies: ["Baja", "Media", "Alta", "Crítica"],
  areas: ["Docencia", "Administración", "Dirección", "Producción", "Otra"],
};

export const DEFAULT_SETTINGS = {
  appTitle: "Retroalimentaciones Musicala",
  introText:
    "Este es un canal confidencial para registrar observaciones, retroalimentaciones o situaciones a tener en cuenta sobre integrantes del equipo Musicala. Es una herramienta interna de cuidado y seguimiento.",
  confidentialityMessage:
    "Tu registro solo será visible para administración. Tu identidad queda guardada de forma confidencial y no será compartida con la persona mencionada.",
  postSubmitMessage:
    "Gracias por tu registro. Administración lo revisará con cuidado y dará el seguimiento adecuado.",
};

export const STATUSES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "retroalimentado", label: "Retroalimentado" },
  { value: "cerrado", label: "Cerrado" },
  { value: "descartado", label: "Descartado" },
];

export const statusLabel = (value) =>
  (STATUSES.find((s) => s.value === value) || {}).label || value;

/* ---------- feedbackEntries ---------- */

export async function createFeedbackEntry(data) {
  return addDoc(collection(db, "feedbackEntries"), {
    ...data,
    status: "pendiente",
    adminNotes: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getFeedbackEntries() {
  const q = query(collection(db, "feedbackEntries"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateFeedbackEntry(id, data) {
  return updateDoc(doc(db, "feedbackEntries", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFeedbackEntry(id) {
  return deleteDoc(doc(db, "feedbackEntries", id));
}

/* ---------- people ---------- */

export async function getPeople(onlyActive = false) {
  const snap = await getDocs(query(collection(db, "people"), orderBy("name")));
  const people = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return onlyActive ? people.filter((p) => p.active !== false) : people;
}

export async function createPerson(data) {
  return addDoc(collection(db, "people"), { active: true, ...data });
}

export async function updatePerson(id, data) {
  return updateDoc(doc(db, "people", id), data);
}

export async function deletePerson(id) {
  return deleteDoc(doc(db, "people", id));
}

/* ---------- authorizedFeedbackUsers ---------- */

export async function getAuthorizedUsers() {
  const snap = await getDocs(collection(db, "authorizedFeedbackUsers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addAuthorizedUser(email, name = "") {
  const id = email.trim().toLowerCase();
  return setDoc(doc(db, "authorizedFeedbackUsers", id), {
    email: id,
    name,
    active: true,
  });
}

export async function updateAuthorizedUser(id, data) {
  return updateDoc(doc(db, "authorizedFeedbackUsers", id), data);
}

export async function removeAuthorizedUser(id) {
  return deleteDoc(doc(db, "authorizedFeedbackUsers", id));
}

/* ---------- feedbackFields / feedbackSettings ---------- */

export async function getFields() {
  const snap = await getDoc(doc(db, "feedbackFields", "config"));
  return snap.exists() ? { ...DEFAULT_FIELDS, ...snap.data() } : DEFAULT_FIELDS;
}

export async function saveFields(fields) {
  return setDoc(doc(db, "feedbackFields", "config"), fields);
}

export async function getSettings() {
  const snap = await getDoc(doc(db, "feedbackSettings", "general"));
  return snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings) {
  return setDoc(doc(db, "feedbackSettings", "general"), settings);
}

/* ---------- utilidades ---------- */

export function formatDate(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
