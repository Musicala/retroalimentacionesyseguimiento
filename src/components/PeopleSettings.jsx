import { useEffect, useState } from "react";
import {
  getPeople,
  createPerson,
  updatePerson,
  deletePerson,
  getFields,
  DEFAULT_FIELDS,
} from "../services/firestoreService";

const EMPTY = { name: "", role: "", area: "" };

export default function PeopleSettings() {
  const [people, setPeople] = useState([]);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [p, f] = await Promise.all([getPeople(), getFields()]);
      setPeople(p);
      setFields(f);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las personas.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    try {
      if (editingId) {
        await updatePerson(editingId, form);
      } else {
        await createPerson(form);
      }
      setForm(EMPTY);
      setEditingId(null);
      await load();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la persona.");
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name || "", role: p.role || "", area: p.area || "" });
  };

  const toggleActive = async (p) => {
    await updatePerson(p.id, { active: p.active === false });
    await load();
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar a ${p.name}? Considera desactivarla en lugar de eliminarla.`)) return;
    await deletePerson(p.id);
    await load();
  };

  return (
    <div className="card">
      <h3>{editingId ? "Editar persona" : "Agregar persona"}</h3>
      <form onSubmit={handleSubmit} className="inline-form">
        <input
          type="text"
          placeholder="Nombre completo *"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <input
          type="text"
          placeholder="Rol (ej. Docente de piano)"
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
        />
        <select value={form.area} onChange={(e) => set("area", e.target.value)}>
          <option value="">Área…</option>
          {fields.areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          {editingId ? "Guardar cambios" : "Agregar"}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY);
            }}
          >
            Cancelar
          </button>
        )}
      </form>
      {error && <p className="error-text">{error}</p>}

      <table className="settings-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Área</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id} className={p.active === false ? "inactive-row" : ""}>
              <td data-label="Nombre">{p.name}</td>
              <td data-label="Rol">{p.role || "—"}</td>
              <td data-label="Área">{p.area || "—"}</td>
              <td data-label="Estado">
                <span className={`badge ${p.active === false ? "badge-off" : "badge-on"}`}>
                  {p.active === false ? "Inactiva" : "Activa"}
                </span>
              </td>
              <td data-label="Acciones" className="actions-cell">
                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>Editar</button>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(p)}>
                  {p.active === false ? "Activar" : "Desactivar"}
                </button>
                <button className="btn btn-ghost btn-sm danger" onClick={() => handleDelete(p)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {people.length === 0 && (
            <tr><td colSpan={5} className="muted">Aún no hay personas registradas.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
