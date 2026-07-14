import { formatDate, statusLabel } from "../services/firestoreService";

const asDate = (value) => {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const safeText = (value) => (value == null || value === "" ? "No registrado" : String(value).trim());

const section = (title, value) => `**${title}:** ${safeText(value)}`;

function downloadText(content, filename) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function summaryForPerson(name, personEntries) {
  const byUrgency = personEntries.reduce((counts, entry) => {
    const urgency = safeText(entry.urgency);
    counts[urgency] = (counts[urgency] || 0) + 1;
    return counts;
  }, {});
  const tags = personEntries.flatMap((entry) => entry.tags || []).reduce((counts, tag) => {
    counts[tag] = (counts[tag] || 0) + 1;
    return counts;
  }, {});
  const repeatedTags = Object.entries(tags)
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => `${tag} (${count})`);
  const open = personEntries.filter((entry) => !["cerrado", "descartado"].includes(entry.status)).length;

  return [
    `### ${name}`,
    `- Registros: **${personEntries.length}** · Casos aún abiertos: **${open}**.`,
    `- Urgencia: ${Object.entries(byUrgency).map(([label, count]) => `${label} (${count})`).join(", ") || "Sin datos"}.`,
    `- Situaciones repetidas: ${repeatedTags.length ? repeatedTags.join(", ") : "No hay etiquetas repetidas registradas"}.`,
  ].join("\n");
}

function entryDetails(entry, index) {
  return [
    `### ${index}. ${safeText(entry.title)}`,
    `- ${section("Fecha", formatDate(entry.createdAt))}`,
    `- ${section("Área", entry.area)} · ${section("Tipo", entry.type)} · ${section("Urgencia", entry.urgency)} · ${section("Estado", statusLabel(entry.status))}`,
    `- ${section("Situaciones", (entry.tags || []).join(", "))}`,
    `- ${section("Descripción", entry.description)}`,
    `- ${section("Contexto", entry.context)}`,
    `- ${section("Evidencia", entry.evidence)}`,
    `- ${section("Acción sugerida al registrar", entry.suggestedAction)}`,
    `- ${section("Requiere seguimiento", entry.requiresFollowUp ? "Sí" : "No")}`,
    `- ${section("Notas administrativas", entry.adminNotes)}`,
  ].join("\n");
}

export function exportAIReport(entries) {
  const chronological = [...entries].sort((a, b) => (asDate(a.createdAt)?.getTime() || 0) - (asDate(b.createdAt)?.getTime() || 0));
  const byPerson = chronological.reduce((groups, entry) => {
    const name = safeText(entry.personName);
    (groups[name] ||= []).push(entry);
    return groups;
  }, {});
  const peopleNames = Object.keys(byPerson);
  const critical = chronological.filter((entry) => (entry.urgency || "").toLowerCase() === "crítica").length;
  const open = chronological.filter((entry) => !["cerrado", "descartado"].includes(entry.status)).length;
  const generatedAt = new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });

  const report = [
    "# Informe para análisis con IA — Retroalimentaciones Musicala",
    "",
    `Generado: ${generatedAt}`,
    `Alcance: **${chronological.length} registro(s)** de **${peopleNames.length} trabajador(es)**, según los filtros activos del tablero.`,
    `Indicadores rápidos: **${critical} crítico(s)** · **${open} caso(s) abierto(s)**.`,
    "",
    "## Prompt listo para copiar en una IA",
    "",
    "Actúa como apoyo de gestión humana para Musicala. Analiza únicamente la información documentada en este informe. Para cada trabajador: (1) resume qué ha ocurrido y su evolución temporal; (2) identifica patrones, asuntos repetidos y registros que podrían referirse al mismo hecho o a hechos relacionados, explicando la evidencia; (3) prioriza riesgos y casos que requieren seguimiento; (4) propone acciones concretas, cuidadosas y proporcionales, indicando responsable, plazo sugerido y qué evidencia adicional conviene obtener; (5) distingue claramente entre hechos registrados, patrones inferidos y datos faltantes. No emitas diagnósticos, no asumas intenciones ni propongas medidas disciplinarias definitivas. Mantén la confidencialidad y usa un lenguaje respetuoso.",
    "",
    "## Resumen por trabajador",
    "",
    ...Object.entries(byPerson).map(([name, personEntries]) => summaryForPerson(name, personEntries)),
    "",
    "## Registros detallados en orden cronológico",
    "",
    ...chronological.map((entry, index) => [
      `## ${safeText(entry.personName)}`,
      entryDetails(entry, index + 1),
      "",
    ].join("\n")),
    "## Nota de uso responsable",
    "Este documento contiene información interna y sensible. Verifica las conclusiones con las personas responsables antes de tomar decisiones; la IA debe apoyar el análisis, no sustituir el criterio humano.",
    "",
  ].join("\n");

  const date = new Date().toISOString().slice(0, 10);
  downloadText(report, `informe-ia-retroalimentaciones-${date}.md`);
}
