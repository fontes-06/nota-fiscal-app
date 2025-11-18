import React, { useMemo, useState } from "react";

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR");
};

const InvoiceHistory = ({ invoices, onClear }) => {
  const [search, setSearch] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const text = (
        (inv.emitter || "") +
        " " +
        (inv.cnpj || "") +
        " " +
        (inv.raw || "")
      )
        .toLowerCase()
        .trim();

      const matchesSearch = search
        ? text.includes(search.toLowerCase())
        : true;

      const value = typeof inv.value === "number" ? inv.value : null;

      const min = minValue ? parseFloat(minValue.replace(",", ".")) : null;
      const max = maxValue ? parseFloat(maxValue.replace(",", ".")) : null;

      const matchesMin = min !== null ? value === null || value >= min : true;
      const matchesMax = max !== null ? value === null || value <= max : true;

      return matchesSearch && matchesMin && matchesMax;
    });
  }, [invoices, search, minValue, maxValue]);

  return (
    <section className="card">
      <header className="card-header row-between">
        <div>
          <h2>Histórico de notas</h2>
          <p className="card-subtitle">
            Todas as notas escaneadas neste dispositivo. Use os filtros para
            localizar uma nota específica.
          </p>
        </div>
        {invoices.length > 0 && (
          <button className="btn btn-outline" onClick={onClear}>
            Limpar histórico
          </button>
        )}
      </header>

      <div className="filters-row">
        <div className="field inline-field">
          <span>Buscar</span>
          <input
            type="text"
            placeholder="por emitente, CNPJ ou texto do QR"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field inline-field">
          <span>Valor mínimo (R$)</span>
          <input
            type="number"
            inputMode="decimal"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
          />
        </div>
        <div className="field inline-field">
          <span>Valor máximo (R$)</span>
          <input
            type="number"
            inputMode="decimal"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">
          {invoices.length === 0
            ? "Nenhuma nota escaneada ainda. Use a aba Scanner para começar."
            : "Nenhuma nota encontrada com os filtros atuais."}
        </p>
      ) : (
        <ul className="invoice-list">
          {filtered.map((inv) => (
            <li key={inv.id} className="invoice-item">
              <div className="invoice-main">
                <span className="invoice-date">
                  {formatDateTime(inv.date)}
                </span>
                <span className="invoice-value">
                  {typeof inv.value === "number"
                    ? `R$ ${inv.value.toFixed(2)}`
                    : "Valor não identificado"}
                </span>
              </div>
              <div className="invoice-extra">
                <span className="invoice-emitter">
                  {inv.emitter || "Emitente não identificado"}
                  {inv.cnpj ? ` · CNPJ: ${inv.cnpj}` : ""}
                </span>
                <details className="invoice-raw">
                  <summary>Ver QR completo</summary>
                  <code>{inv.raw}</code>
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default InvoiceHistory;
