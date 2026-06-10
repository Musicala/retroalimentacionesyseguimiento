import { useEffect, useState } from "react";
import { getFields, saveFields, DEFAULT_FIELDS } from "../services/firestoreService";

const SECTIONS = [
  { key: "types", label: "Tipos de retroalimentación" },
  { key: "urgencies", label: "Urgencias" },
  { key: "areas", label: "Áreas" },
];

export default function FieldsSettings() {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [newValues, setNewValues] = useState({ types: "", urgencies: "", areas: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getFields().then(setFields).catch(console.error);
  }, []);

  const persist = async (updated) => {
    setMessage("");
    setError("");
    try {
      await saveFields(updated);
      setFields(updated);
      setMessage("Configuración guardada.");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la configuración.");
    }
  };

  const addItem = (key) => {
    const value = newValues[key].trim();
    if (!value || fields[key].includes(value)) return;
    setNewValues((v) => ({ ...v, [key]: "" }));
    persist({ ...fields, [key]: [...fields[key], value] });
  };

  const removeItem = (key, item) => {
    if (fields[key].length <= 1) {
      setError("Debe quedar al menos una opción en cada lista.");
      return;
    }
    persist({ ...fields, [key]: fields[key].filter((i) => i !== item) });
  };

  return (
    <div className="fields-settings">
      {SECTIONS.map((section) => (
        <div className="card" key={section.key}>
          <h3>{section.label}</h3>
          <div className="chips">
            {fields[section.key].map((item) => (
              <span className="chip" key={item}>
                {item}
                <button
                  className="chip-remove"
                  title="Quitar"
                  onClick={() => removeItem(section.key, item)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              addItem(section.key);
            }}
          >
            <input
              type="text"
              placeholder="Nueva opción…"
              value={newValues[section.key]}
              onChange={(e) =>
                setNewValues((v) => ({ ...v, [section.key]: e.target.value }))
              }
            />
            <button type="submit" className="btn btn-secondary">Agregar</button>
          </form>
        </div>
      ))}
      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
