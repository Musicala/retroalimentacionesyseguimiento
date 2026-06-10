import { useEffect, useState } from "react";
import {
  getAuthorizedUsers,
  addAuthorizedUser,
  updateAuthorizedUser,
  removeAuthorizedUser,
} from "../services/firestoreService";
import { ADMIN_EMAILS } from "../firebase";

export default function AuthorizedUsersSettings() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setUsers(await getAuthorizedUsers());
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los correos autorizados.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError("Ingresa un correo válido.");
      return;
    }
    try {
      await addAuthorizedUser(clean, name.trim());
      setEmail("");
      setName("");
      await load();
    } catch (err) {
      console.error(err);
      setError("No se pudo agregar el correo.");
    }
  };

  const toggleActive = async (u) => {
    await updateAuthorizedUser(u.id, { active: u.active === false });
    await load();
  };

  const handleRemove = async (u) => {
    if (!window.confirm(`¿Quitar la autorización de ${u.email}?`)) return;
    await removeAuthorizedUser(u.id);
    await load();
  };

  return (
    <div className="card">
      <h3>Correos autorizados</h3>
      <p className="muted small">
        Los administradores ({ADMIN_EMAILS.join(", ")}) siempre tienen acceso y no necesitan
        estar en esta lista.
      </p>
      <form onSubmit={handleAdd} className="inline-form">
        <input
          type="email"
          placeholder="correo@ejemplo.com *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Autorizar</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <table className="settings-table">
        <thead>
          <tr>
            <th>Correo</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className={u.active === false ? "inactive-row" : ""}>
              <td data-label="Correo">{u.email || u.id}</td>
              <td data-label="Nombre">{u.name || "—"}</td>
              <td data-label="Estado">
                <span className={`badge ${u.active === false ? "badge-off" : "badge-on"}`}>
                  {u.active === false ? "Inactivo" : "Activo"}
                </span>
              </td>
              <td data-label="Acciones" className="actions-cell">
                <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(u)}>
                  {u.active === false ? "Activar" : "Desactivar"}
                </button>
                <button className="btn btn-ghost btn-sm danger" onClick={() => handleRemove(u)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={4} className="muted">Aún no hay correos autorizados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
