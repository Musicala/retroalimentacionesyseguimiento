import { formatDate, STATUSES } from "../services/firestoreService";

const urgencyClass = (u) =>
  ({ baja: "badge-low", media: "badge-mid", alta: "badge-high", critica: "badge-critical" }[
    (u || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  ] || "");

const summaryText = (entry) =>
  entry.description || entry.context || entry.suggestedAction || "Sin observaciones registradas.";

export default function FeedbackList({ entries, savingId, onSelect, onStatusChange }) {
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
            <th>Observaciones</th>
            <th>Tipo</th>
            <th>Urgencia</th>
            <th>Estado</th>
            <th>Enviado por</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} onClick={() => onSelect(entry.id)} className="clickable-row">
              <td data-label="Fecha">{formatDate(entry.createdAt)}</td>
              <td data-label="Persona"><strong>{entry.personName}</strong></td>
              <td data-label="Título">{entry.title}</td>
              <td data-label="Observaciones" className="observations-cell">
                {summaryText(entry)}
              </td>
              <td data-label="Tipo">{entry.type}</td>
              <td data-label="Urgencia">
                <span className={`badge ${urgencyClass(entry.urgency)}`}>{entry.urgency}</span>
              </td>
              <td data-label="Estado">
                <select
                  className={`status-select status-${entry.status}`}
                  value={entry.status}
                  disabled={savingId === entry.id}
                  aria-label={`Estado de ${entry.personName}`}
                  title={savingId === entry.id ? "Guardando..." : "Cambiar estado"}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => {
                    event.stopPropagation();
                    onStatusChange(entry.id, event.target.value);
                  }}
                >
                  {STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </td>
              <td data-label="Enviado por">{entry.createdByName || entry.createdByEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
