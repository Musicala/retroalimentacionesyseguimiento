import { signOut } from "../auth";

export default function Layout({ user, role, view, onNavigate, appTitle, children }) {
  const navItems =
    role === "admin"
      ? [
          { key: "dashboard", label: "Dashboard" },
          { key: "form", label: "Nueva retroalimentación" },
          { key: "settings", label: "Configuración" },
        ]
      : [{ key: "form", label: "Nueva retroalimentación" }];

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-brand">
          <img
            className="logo-img"
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Musicala"
          />
          <span className="topbar-title">{appTitle}</span>
        </div>
        <nav className="topbar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${view === item.key ? "active" : ""}`}
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="topbar-user">
          {user.photoURL && (
            <img className="avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
          )}
          <div className="topbar-user-info">
            <span className="user-name">{user.displayName}</span>
            <span className="user-role">{role === "admin" ? "Administrador" : "Equipo"}</span>
          </div>
          <button className="btn btn-ghost" onClick={signOut}>
            Salir
          </button>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer">
        Musicala · Canal confidencial interno de cuidado y seguimiento
      </footer>
    </div>
  );
}
