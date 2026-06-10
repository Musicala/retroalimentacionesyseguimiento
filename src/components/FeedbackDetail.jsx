import { useState } from "react";
import {
  updateFeedbackEntry,
  deleteFeedbackEntry,
  formatDate,
  statusLabel,
  STATUSES,
} from "../services/firestoreService";

export default function FeedbackDetail({ entry, onBack, onChanged }) {
  const [notes, setNotes] = useState(entry.adminNotes || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const apply = async (data, msg) => {
    setSaving(true);
    setMessage("");
    try {
      await updateFeedbackEntry(entry.id, data);
      setMessage(msg);
      await onChanged();
    } catch (err) {
      console.error(err);
      setMessage("Error al guardar el cambio.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar definitivamente este registro? Esta acción no se puede deshacer.")) return;
    try {
      await deleteFeedbackEntry(entry.id);
      await onChanged();
      onBack();
    } catch (err) {
      console.error(err);
      setMessage("Error al eliminar el registro.");
    }
  };

  return (
    <div className="detail">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        ← Volver al listado
      </button>

      <div className="card">
        <div className="detail-header">
          <div>
            <h2>{entry.title}</h2>
            <p className="muted">
              Sobre <strong>{entry.personName}</strong>
              {entry.area ? ` · ${entry.area}` : ""}
            </p>
          </div>
          <span className={`badge status-${entry.status} badge-lg`}>
            {statusLabel(entry.status)}
          </span>
        </div>

        <div className="detail-grid">
          <DetailItem label="Tipo" value={entry.type} />
          <DetailItem label="Urgencia" value={entry.urgency} />
          <DetailItem label="Requiere seguimiento" value={entry.requiresFollowUp ? "Sí" : "No"} />
          <DetailItem label="Creado" value={formatDate(entry.createdAt)} />
          <DetailItem label="Actualizado" value={formatDate(entry.updatedAt)} />
          <DetailItem
            label="Enviado por"
            value={`${entry.createdByName || ""} (${entry.createdByEmail})`}
          />
        </div>

        <DetailBlock label="Descripción" value={entry.description} />
        <DetailBlock label="Contexto" value={entry.context} />
        <DetailBlock label="Evidencia" value={entry.evidence} />
        <DetailBlock label="Acción sugerida" value={entry.suggestedAction} />
      </div>

      <div className="card">
        <h3>Gestión administrativa</h3>

        <label className="field">
          <span>Notas administrativas internas</span>
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button
          className="btn btn-secondary"
          disabled={saving}
          onClick={() => apply({ adminNotes: notes }, "Notas guardadas.")}
        >
          Guardar notas
        </button>

        <div className="status-actions">
          <span className="field-label">Cambiar estado:</span>
          <div className="status-buttons">
            <button
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => apply({ status: "en_revision" }, "Marcado en revisión.")}
            >
              En revisión
            </button>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => apply({ status: "retroalimentado" }, "Marcado como retroalimentado.")}
            >
              Marcar como retroalimentado
            </button>
            <button
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => apply({ status: "cerrado" }, "Caso cerrado.")}
            >
              Cerrar caso
            </button>
            <button
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => apply({ status: "descartado" }, "Caso descartado.")}
            >
              Descartar
            </button>
            <button
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => apply({ status: "pendiente" }, "Devuelto a pendiente.")}
            >
              Volver a pendiente
            </button>
          </div>
          <details className="status-select-alt">
            <summary>Más opciones de estado</summary>
            <select
              value={entry.status}
              onChange={(e) => apply({ status: e.target.value }, "Estado actualizado.")}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </details>
        </div>

        {message && <p className="success-text">{message}</p>}

        <div className="danger-zone">
          <button className="btn btn-danger" onClick={handleDelete}>
            Eliminar registro
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span className="field-label">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}

function DetailBlock({ label, value }) {
  if (!value) return null;
  return (
    <div className="detail-block">
      <span className="field-label">{label}</span>
      <p>{value}</p>
    </div>
  );
}
