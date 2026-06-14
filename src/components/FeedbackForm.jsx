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
  tags: [],
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
  const [showDetails, setShowDetails] = useState(false);
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

  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));

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
    if (!form.personId) {
      setError("Selecciona la persona.");
      return;
    }
    if (form.tags.length === 0 && !form.description.trim()) {
      setError("Marca al menos una situación o escribe una nota.");
      return;
    }
    setSubmitting(true);
    try {
      // Título automático: situaciones marcadas, o el inicio de la nota.
      const autoTitle =
        form.tags.join(", ") ||
        form.description.trim().slice(0, 80) ||
        "Observación";
      await createFeedbackEntry({
        ...form,
        title: form.title.trim() || autoTitle,
        urgency: form.urgency || "Baja",
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
        <h2>Registro guardado</h2>
        <p>{settings.postSubmitMessage}</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(EMPTY_FORM);
            setShowDetails(false);
            setSubmitted(false);
          }}
        >
          Anotar otra cosa
        </button>
      </div>
    );
  }

  return (
    <div className="form-wrapper">
      <div className="card">
        <h2>Anotar algo rápido</h2>
        <div className="confidential-note">{settings.confidentialityMessage}</div>

        <form onSubmit={handleSubmit} className="feedback-form">
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

          {fields.quickTags && fields.quickTags.length > 0 && (
            <div className="field">
              <span>¿Qué pasó? (toca las que apliquen)</span>
              <div className="tag-toggle-group">
                {fields.quickTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    className={`tag-toggle ${form.tags.includes(tag) ? "active" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="field">
            <span>Nota</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Escribe en pocas palabras lo que percibiste (opcional si ya marcaste una situación)"
            />
          </label>

          <button
            type="button"
            className="btn btn-ghost details-toggle"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "− Ocultar detalles" : "+ Agregar detalles (opcional)"}
          </button>

          {showDetails && (
            <div className="details-section">
              <div className="form-grid">
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
                  <span>Tipo</span>
                  <select value={form.type} onChange={(e) => set("type", e.target.value)}>
                    <option value="">Selecciona…</option>
                    {fields.types.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Urgencia</span>
                  <select value={form.urgency} onChange={(e) => set("urgency", e.target.value)}>
                    <option value="">Baja (por defecto)</option>
                    {fields.urgencies.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Título</span>
                  <input
                    type="text"
                    value={form.title}
                    maxLength={120}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Si lo dejas vacío se genera solo"
                  />
                </label>
              </div>

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
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? "Guardando…" : "Guardar registro"}
          </button>
        </form>
      </div>
    </div>
  );
}
