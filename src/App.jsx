import React, { useEffect, useState } from "react";
import Scanner from "./components/Scanner";
import InvoiceHistory from "./components/InvoiceHistory";
import Overview from "./components/Overview";
import Login from "./components/Login";

const STORAGE_KEY_INVOICES = "fyscyaly_invoices";
const STORAGE_KEY_USER = "fyscyaly_user";

function App() {
  const [activeTab, setActiveTab] = useState("scanner");
  const [invoices, setInvoices] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INVOICES);
    if (saved) {
      try {
        setInvoices(JSON.parse(saved));
      } catch {
        setInvoices([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
  }, [user]);

  const handleNewInvoice = (invoiceData) => {
    setInvoices((prev) => [
      {
        id: Date.now(),
        date: new Date().toISOString(),
        ...invoiceData,
      },
      ...prev,
    ]);
    setActiveTab("history");
  };

  const handleClearHistory = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico?")) {
      setInvoices([]);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Sair do Fyscyaly neste dispositivo?")) {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const scannerClass =
    "tab-btn " + (activeTab === "scanner" ? "active" : "");
  const historyClass =
    "tab-btn " + (activeTab === "history" ? "active" : "");
  const overviewClass =
    "tab-btn " + (activeTab === "overview" ? "active" : "");

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <img src="/logo.jpg" alt="Fyscyaly" className="app-logo" />
          <div>
            <h1 className="app-title">Fyscyaly</h1>
            <p className="app-subtitle">
              Scanner inteligente de notas fiscais
            </p>
          </div>
        </div>
        <div className="app-header-right">
          <div className="user-chip">
            <span className="user-avatar">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="chip-logout" onClick={handleLogout} title="Sair">
              ⏏
            </button>
          </div>
          <span className="pill pill-primary">Beta</span>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={scannerClass}
          onClick={() => setActiveTab("scanner")}
        >
          📷 Scanner
        </button>
        <button
          className={historyClass}
          onClick={() => setActiveTab("history")}
        >
          📜 Histórico
        </button>
        <button
          className={overviewClass}
          onClick={() => setActiveTab("overview")}
        >
          📊 Visão geral
        </button>
      </nav>

      <main className="app-main">
        {activeTab === "scanner" && (
          <Scanner onInvoiceRead={handleNewInvoice} />
        )}

        {activeTab === "history" && (
          <InvoiceHistory
            invoices={invoices}
            onClear={handleClearHistory}
          />
        )}

        {activeTab === "overview" && <Overview invoices={invoices} />}
      </main>

      <footer className="app-footer">
        <span>Fyscyaly · {new Date().getFullYear()}</span>
        <span className="footer-dot">•</span>
        <span>Organize seus cupons e NF-e em segundos</span>
      </footer>
    </div>
  );
}

export default App;
