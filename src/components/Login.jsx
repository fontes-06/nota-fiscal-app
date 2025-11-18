import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Informe seu nome.");
      return;
    }
    onLogin({
      name: name.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <img src="/logo.jpg" alt="Fyscaly" className="login-logo" />
        <h1 className="login-title">Fyscaly</h1>
        <p className="login-subtitle">
          Bem-vindo(a)! Antes de começar a escanear notas, personalize seu
          acesso neste dispositivo.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="field">
            <span>Nome</span>
            <input
              type="text"
              placeholder="Como quer ser chamado(a)?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>

          <label className="field">
            <span>E-mail (opcional)</span>
            <input
              type="email"
              placeholder="para exportar no futuro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <button type="submit" className="btn btn-primary login-btn">
            Entrar no Fyscaly
          </button>
        </form>

        <p className="login-footnote">
          Os dados ficam apenas neste dispositivo, usando armazenamento local.
        </p>
      </div>
    </div>
  );
};

export default Login;
