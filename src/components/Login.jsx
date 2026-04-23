import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { authenticateUser, registerUser, saveSession } from '../auth';
import { isCloudEnabled } from '../cloud';

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email || !password || (mode === 'register' && !name.trim())) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    // Simulate a small delay for UX
    await new Promise((r) => setTimeout(r, 600));

    try {
      const user = mode === 'register'
        ? await registerUser({ name: name.trim(), email, password })
        : await authenticateUser(email, password);

      if (user?.pendingConfirmation) {
        setMode('login');
        setPassword('');
        setInfo(user.message);
        setLoading(false);
        return;
      }

      if (user) {
        saveSession(user);
        onLogin(user);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } catch (err) {
      setError(err.message || 'Não foi possível autenticar.');
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand-wrapper">
          <div className="login-brand">
            One controll
          </div>
          <div className="tagline" style={{ marginLeft: '4px', marginBottom: '1.5rem' }}>from RoqIA</div>
        </div>
        <p className="login-subtitle">
          {isCloudEnabled
            ? 'Entre ou crie sua conta para sincronizar suas finanças entre dispositivos.'
            : 'Faça login para acessar suas finanças com segurança.'}
        </p>

        <div className="login-divider" />

        {isCloudEnabled && (
          <div className="auth-toggle">
            <button
              type="button"
              className={`auth-toggle-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`auth-toggle-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Criar conta
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {info && (
          <div className="login-success">
            <AlertCircle size={16} />
            {info}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Nome</label>
              <input
                className="form-control"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                className="form-control"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                className="form-control"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingLeft: 38, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
                  alignItems: 'center', padding: 0,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '0.5rem', fontSize: '0.95rem' }}
          >
            {loading ? (
              <span style={{ opacity: 0.7 }}>Entrando...</span>
            ) : (
              <>{mode === 'register' ? 'Criar conta' : 'Entrar'} <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="login-footer">
          One controll &copy; {new Date().getFullYear()} — Controle Financeiro Pessoal
        </div>
      </div>
    </div>
  );
};

export default Login;
