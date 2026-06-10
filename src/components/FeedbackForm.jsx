import { useEffect, useState } from "react";
import {
  getPeople,
  getFields,
  createFeedbackEntry,
  DEFAULT_FIELDS,
} from "../services/firestoreService";

const EMPTY_FORM = {
  personId: "",
  personName: "",
  area: "",
  type: "",
  urgency: "",
  title: "",
  description: "",
  context: "",
  evidence: "",
  suggestedAction: "",
  requiresFollowUp: "no",
};

export default function FeedbackForm({ user, settings }) {
  const [people, setPeople] = useState([]);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [p, f] = await Promise.all([getPeople(true), getFields()]);
        setPeople(p);
        setFields(f);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos del formulario.");
      }
    })();
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handlePersonChange = (id) => {
    const person = people.find((p) => p.id === id);
    setForm((f) => ({
      ...f,
      personId: id,
      personName: person ? person.name : "",
      area: person && person.area ? person.area : f.area,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.personId || !form.type || !form.urgency || !form.title || !form.description) {
      setError("Por favor completa los campos obligatorios marcados con *.");
      return;
    }
    setSubmitting(true);
    try {
      await createFeedbackEntry({
        ...form,
        requiresFollowUp: form.requiresFollowUp === "si",
        createdByEmail: user.email.toLowerCase(),
        createdByName: user.displayName || "",
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el registro. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="card confirmation-card">
        <div className="check-icon">✓</div>
        <h2>Registro enviado</h2>
        <p>{settings.postSubmitMessage}</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(EMPTY_FORM);
            setSubmitted(false);
          }}
        >
          Crear otro registro
        </button>
      </div>
    );
  }

  return (
    <div className="form-wrapper">
      <div className="card">
        <h2>Nueva retroalimentación</h2>
        <div className="confidential-note">{settings.confidentialityMessage}</div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-grid">
            <label className="field">
              <span>Persona *</span>
              <select
                value={form.personId}
                onChange={(e) => handlePersonChange(e.target.value)}
                required
              >
                <option value="">Selecciona una persona…</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.role ? `· ${p.role}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Área o rol</span>
              <select value={form.area} onChange={(e) => set("area", e.target.value)}>
                <option value="">Selecciona…</option>
                {fields.areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Tipo de retroalimentación *</span>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} required>
                <option value="">Selecciona…</option>
                {fields.types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Urgencia *</span>
              <select value={form.urgency} onChange={(e) => set("urgency", e.target.value)} required>
                <option value="">Selecciona…</option>
                {fields.urgencies.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Título breve *</span>
            <input
              type="text"
              value={form.title}
              maxLength={120}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Resumen corto de la situación"
              required
            />
          </label>

          <label className="field">
            <span>Descripción detallada *</span>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe la situación con el mayor detalle posible"
              required
            />
          </label>

          <label className="field">
            <span>Contexto</span>
            <textarea
              rows={3}
              value={form.context}
              onChange={(e) => set("context", e.target.value)}
              placeholder="¿Cuándo, dónde, con quién o en qué situación ocurrió?"
            />
          </label>

          <label className="field">
            <span>Evidencia o enlace</span>
            <input
              type="text"
              value={form.evidence}
              onChange={(e) => set("evidence", e.target.value)}
              placeholder="Texto de evidencia o enlace, si existe"
            />
          </label>

          <label className="field">
            <span>Acción sugerida</span>
            <textarea
              rows={2}
              value={form.suggestedAction}
              onChange={(e) => set("suggestedAction", e.target.value)}
              placeholder="¿Qué sugieres que se haga?"
            />
          </label>

          <fieldset className="field radio-field">
            <span>¿Requiere seguimiento?</span>
            <div className="radio-row">
              <label>
                <input
                  type="radio"
                  name="followup"
                  checked={form.requiresFollowUp === "si"}
                  onChange={() => set("requiresFollowUp", "si")}
                />
                Sí
              </label>
              <label>
                <input
                  type="radio"
                  name="followup"
                  checked={form.requiresFollowUp === "no"}
                  onChange={() => set("requiresFollowUp", "no")}
                />
                No
              </label>
            </div>
          </fieldset>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? "Enviando…" : "Enviar retroalimentación"}
          </button>
        </form>
      </div>
    </div>
  );
}
