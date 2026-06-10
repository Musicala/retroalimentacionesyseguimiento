import { formatDate, statusLabel } from "../services/firestoreService";

const COLUMNS = [
  ["Fecha", (e) => formatDate(e.createdAt)],
  ["Persona", (e) => e.personName],
  ["Área", (e) => e.area],
  ["Tipo", (e) => e.type],
  ["Urgencia", (e) => e.urgency],
  ["Título", (e) => e.title],
  ["Descripción", (e) => e.description],
  ["Contexto", (e) => e.context],
  ["Evidencia", (e) => e.evidence],
  ["Acción sugerida", (e) => e.suggestedAction],
  ["Requiere seguimiento", (e) => (e.requiresFollowUp ? "Sí" : "No")],
  ["Estado", (e) => statusLabel(e.status)],
  ["Notas administrativas", (e) => e.adminNotes],
  ["Enviado por", (e) => e.createdByName],
  ["Correo", (e) => e.createdByEmail],
  ["Actualizado", (e) => formatDate(e.updatedAt)],
];

const escapeCell = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function exportToCSV(entries, filename = "retroalimentaciones-musicala.csv") {
  const header = COLUMNS.map(([label]) => label).join(",");
  const rows = entries.map((e) =>
    COLUMNS.map(([, getter]) => escapeCell(getter(e))).join(",")
  );
  // BOM para que Excel abra el archivo con acentos correctos
  const csv = "﻿" + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
