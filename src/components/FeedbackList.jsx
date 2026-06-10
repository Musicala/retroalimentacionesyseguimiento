import { formatDate, statusLabel } from "../services/firestoreService";

const urgencyClass = (u) =>
  ({ baja: "badge-low", media: "badge-mid", alta: "badge-high", crítica: "badge-critical" }[
    (u || "").toLowerCase()
  ] || "");

export default function FeedbackList({ entries, onSelect }) {
  if (entries.length === 0) {
    return (
      <div className="card empty-state">
        <p>No hay retroalimentaciones que coincidan con los filtros.</p>
      </div>
    );
  }

  return (
    <div className="card table-card">
      <table className="feedback-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Persona</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Urgencia</th>
            <th>Estado</th>
            <th>Enviado por</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} onClick={() => onSelect(e.id)} className="clickable-row">
              <td data-label="Fecha">{formatDate(e.createdAt)}</td>
              <td data-label="Persona"><strong>{e.personName}</strong></td>
              <td data-label="Título">{e.title}</td>
              <td data-label="Tipo">{e.type}</td>
              <td data-label="Urgencia">
                <span className={`badge ${urgencyClass(e.urgency)}`}>{e.urgency}</span>
              </td>
              <td data-label="Estado">
                <span className={`badge status-${e.status}`}>{statusLabel(e.status)}</span>
              </td>
              <td data-label="Enviado por">{e.createdByName || e.createdByEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
