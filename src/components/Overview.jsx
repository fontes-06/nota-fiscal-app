import React, { useMemo } from "react";

const Overview = ({ invoices }) => {
  const stats = useMemo(() => {
    const total = invoices.length;

    const values = invoices
      .map((i) => (typeof i.value === "number" ? i.value : null))
      .filter((v) => v !== null);

    const sum = values.reduce((acc, v) => acc + v, 0);
    const avg = values.length ? sum / values.length : 0;

    const lastDate = invoices[0]?.date ? new Date(invoices[0].date) : null;

    const perEmitter = {};
    invoices.forEach((inv) => {
      const key = inv.emitter || "Sem identificação";
      if (!perEmitter[key]) {
        perEmitter[key] = { count: 0, sum: 0 };
      }
      perEmitter[key].count += 1;
      if (typeof inv.value === "number") {
        perEmitter[key].sum += inv.value;
      }
    });

    const emitterList = Object.entries(perEmitter)
      .map(([name, info]) => ({
        name,
        count: info.count,
        sum: info.sum,
      }))
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 5);

    return { total, sum, avg, lastDate, emitterList };
  }, [invoices]);

  return (
    <section className="card">
      <header className="card-header">
        <h2>Visão geral</h2>
        <p className="card-subtitle">
          Acompanhe o volume de notas e onde você mais gasta.
        </p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Notas escaneadas</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total identificado</span>
          <span className="stat-value">
            {stats.sum ? `R$ ${stats.sum.toFixed(2)}` : "—"}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Ticket médio</span>
          <span className="stat-value">
            {stats.avg ? `R$ ${stats.avg.toFixed(2)}` : "—"}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Última leitura</span>
          <span className="stat-value">
            {stats.lastDate
              ? stats.lastDate.toLocaleString("pt-BR")
              : "Nenhuma ainda"}
          </span>
        </div>
      </div>

      <div className="top-emitters">
        <h3>Top locais de gasto</h3>
        {stats.emitterList.length === 0 ? (
          <p className="empty-state">
            Assim que você escanear notas com emitente identificado, eles
            aparecerão aqui.
          </p>
        ) : (
          <ul>
            {stats.emitterList.map((e) => (
              <li key={e.name} className="emitter-item">
                <div className="emitter-main">
                  <span className="emitter-name">{e.name}</span>
                  <span className="emitter-sum">
                    R$ {e.sum.toFixed(2)} · {e.count} nota(s)
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="overview-hint">
        Próximos passos para o Fyscaly podem incluir exportação em CSV, metas
        de gasto mensal e alertas de garantia das compras.
      </p>
    </section>
  );
};

export default Overview;
