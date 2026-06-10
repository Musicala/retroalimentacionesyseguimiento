import { useEffect, useState } from "react";
import { watchAuth, resolveRole, signOut } from "./auth";
import { getSettings, DEFAULT_SETTINGS } from "./services/firestoreService";
import Login from "./components/Login";
import Layout from "./components/Layout";
import FeedbackForm from "./components/FeedbackForm";
import AdminDashboard from "./components/AdminDashboard";
import SettingsPanel from "./components/SettingsPanel";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // null = cargando
  const [view, setView] = useState("dashboard");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchAuth(async (u) => {
      setLoading(true);
      setUser(u);
      if (u) {
        const r = await resolveRole(u);
        setRole(r);
        setView(r === "admin" ? "dashboard" : "form");
        try {
          setSettings(await getSettings());
        } catch {
          /* usuarios no autorizados no pueden leer settings */
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="screen-center">
        <div className="spinner" />
        <p className="muted">Cargando…</p>
      </div>
    );
  }

  if (!user) return <Login settings={settings} />;

  if (role === "none") {
    return (
      <div className="screen-center">
        <div className="card unauthorized-card">
          <img
            className="logo-img big"
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Musicala"
          />
          <h2>Acceso no autorizado</h2>
          <p>
            Tu correo no está autorizado para usar este canal. Si crees que es
            un error, comunícate con administración.
          </p>
          <p className="muted small">{user.email}</p>
          <button className="btn btn-secondary" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout
      user={user}
      role={role}
      view={view}
      onNavigate={setView}
      appTitle={settings.appTitle}
    >
      {view === "form" && <FeedbackForm user={user} settings={settings} />}
      {role === "admin" && view === "dashboard" && <AdminDashboard />}
      {role === "admin" && view === "settings" && (
        <SettingsPanel onSettingsSaved={setSettings} />
      )}
    </Layout>
  );
}
