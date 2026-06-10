import { useState } from "react";
import PeopleSettings from "./PeopleSettings";
import AuthorizedUsersSettings from "./AuthorizedUsersSettings";
import FieldsSettings from "./FieldsSettings";
import GeneralSettings from "./GeneralSettings";

const TABS = [
  { key: "people", label: "Personas" },
  { key: "users", label: "Correos autorizados" },
  { key: "fields", label: "Campos" },
  { key: "general", label: "Ajustes generales" },
];

export default function SettingsPanel({ onSettingsSaved }) {
  const [tab, setTab] = useState("people");

  return (
    <div className="settings">
      <h2>Configuración</h2>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "people" && <PeopleSettings />}
      {tab === "users" && <AuthorizedUsersSettings />}
      {tab === "fields" && <FieldsSettings />}
      {tab === "general" && <GeneralSettings onSaved={onSettingsSaved} />}
    </div>
  );
}
