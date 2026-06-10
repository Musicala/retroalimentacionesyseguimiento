import { useEffect, useState } from "react";
import { getSettings, saveSettings, DEFAULT_SETTINGS } from "../services/firestoreService";

export default function GeneralSettings({ onSaved }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  const set = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await saveSettings(settings);
      setMessage("Ajustes guardados.");
      if (onSaved) onSaved(settings);
    } catch (err) {
      console.error(err);
      setError("No se pudieron guardar los ajustes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h3>Ajustes generales</h3>
      <form onSubmit={handleSave} className="stacked-form">
        <label className="field">
          <span>Título de la app</span>
          <input
            type="text"
            value={settings.appTitle}
            onChange={(e) => set("appTitle", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Texto introductorio (pantalla de inicio de sesión)</span>
          <textarea
            rows={3}
            value={settings.introText}
            onChange={(e) => set("introText", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Mensaje de confidencialidad (formulario)</span>
          <textarea
            rows={3}
            value={settings.confidentialityMessage}
            onChange={(e) => set("confidentialityMessage", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Mensaje posterior al envío</span>
          <textarea
            rows={3}
            value={settings.postSubmitMessage}
            onChange={(e) => set("postSubmitMessage", e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Guardando…" : "Guardar ajustes"}
        </button>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}
