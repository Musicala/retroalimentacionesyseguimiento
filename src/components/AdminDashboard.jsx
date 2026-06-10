import { useEffect, useMemo, useState } from "react";
import {
  getFeedbackEntries,
  getPeople,
  getFields,
  DEFAULT_FIELDS,
  STATUSES,
} from "../services/firestoreService";
import { exportToCSV } from "../utils/csvExport";
import FeedbackList from "./FeedbackList";
import FeedbackDetail from "./FeedbackDetail";

const EMPTY_FILTERS = {
  search: "",
  person: "",
  area: "",
  type: "",
  urgency: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export default function AdminDashboard() {
  const [entries, setEntries] = useState([]);
  const [people, setPeople] = useState([]);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [e, p, f] = await Promise.all([getFeedbackEntries(), getPeople(), getFields()]);
      setEntries(e);
      setPeople(p);
      setFields(f);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las retroalimentaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filters.person && e.personId !== filters.person) return false;
      if (filters.area && e.area !== filters.area) return false;
      if (filters.type && e.type !== filters.type) return false;
      if (filters.urgency && e.urgency !== filters.urgency) return false;
      if (filters.status && e.status !== filters.status) return false;
      const created = e.createdAt && e.createdAt.toDate ? e.createdAt.toDate() : null;
      if (filters.dateFrom && created && created < new Date(filters.dateFrom + "T00:00:00")) return false;
      if (filters.dateTo && created && created > new Date(filters.dateTo + "T23:59:59")) return false;
      if (filters.search) {
        const text = filters.search.toLowerCase();
        const haystack = [
          e.personName, e.title, e.description, e.context, e.area,
          e.type, e.createdByName, e.createdByEmail, e.adminNotes,
        ].join(" ").toLowerCase();
        if (!haystack.includes(text)) return false;
      }
      return true;
    });
  }, [entries, filters]);

  const stats = useMemo(
    () => ({
      total: entries.length,
      pendientes: entries.filter((e) => e.status === "pendiente").length,
      criticas: entries.filter((e) => (e.urgency || "").toLowerCase() === "crítica").length,
      retroalimentadas: entries.filter((e) => e.status === "retroalimentado").length,
      cerradas: entries.filter((e) => e.status === "cerrado").length,
    }),
    [entries]
  );

  const selectedEntry = selected ? entries.find((e) => e.id === selected) : null;

  if (selectedEntry) {
    return (
      <FeedbackDetail
        entry={selectedEntry}
        onBack={() => setSelected(null)}
        onChanged={load}
      />
    );
  }

  return (
    <div className="dashboard">
      <div className="stats-row">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pendientes" value={stats.pendientes} tone="warn" />
        <StatCard label="Críticas" value={stats.criticas} tone="danger" />
        <StatCard label="Retroalimentadas" value={stats.retroalimentadas} tone="ok" />
        <StatCard label="Cerradas" value={stats.cerradas} />
      </div>

      <div className="card filters-card">
        <div className="filters-grid">
          <input
            type="search"
            placeholder="Buscar por texto…"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="search-input"
          />
          <select value={filters.person} onChange={(e) => setFilter("person", e.target.value)}>
            <option value="">Persona: todas</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select value={filters.area} onChange={(e) => setFilter("area", e.target.value)}>
            <option value="">Área: todas</option>
            {fields.areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select value={filters.type} onChange={(e) => setFilter("type", e.target.value)}>
            <option value="">Tipo: todos</option>
            {fields.types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={filters.urgency} onChange={(e) => setFilter("urgency", e.target.value)}>
            <option value="">Urgencia: todas</option>
            {fields.urgencies.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
            <option value="">Estado: todos</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <label className="date-filter">
            <span>Desde</span>
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilter("dateFrom", e.target.value)} />
          </label>
          <label className="date-filter">
            <span>Hasta</span>
            <input type="date" value={filters.dateTo} onChange={(e) => setFilter("dateTo", e.target.value)} />
          </label>
        </div>
        <div className="filters-actions">
          <button className="btn btn-ghost" onClick={() => setFilters(EMPTY_FILTERS)}>
            Limpiar filtros
          </button>
          <button className="btn btn-secondary" onClick={() => exportToCSV(filtered)}>
            Exportar CSV ({filtered.length})
          </button>
          <button className="btn btn-secondary" onClick={load}>
            Actualizar
          </button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <div className="screen-center"><div className="spinner" /></div>
      ) : (
        <FeedbackList entries={filtered} onSelect={setSelected} />
      )}
    </div>
  );
}

function StatCard({ label, value, tone = "" }) {
  return (
    <div className={`stat-card ${tone}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
