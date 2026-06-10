import { useState } from "react";
import { signInWithGoogle } from "../auth";

export default function Login({ settings }) {
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    }
  };

  return (
    <div className="screen-center login-bg">
      <div className="card login-card">
        <img
          className="logo-img big"
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Musicala"
        />
        <h1>{settings.appTitle}</h1>
        <p className="muted">{settings.introText}</p>
        <div className="confidential-note">{settings.confidentialityMessage}</div>
        <button className="btn btn-primary btn-google" onClick={handleLogin}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Iniciar sesión con Google
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
