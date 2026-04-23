import React from 'react';
import { Check, LayoutTemplate, MonitorCog, Palette, UserRound } from 'lucide-react';

const THEME_OPTIONS = [
  { id: 'midnight', label: 'Noite dourada', description: 'Visual atual, elegante e de alto contraste.' },
  { id: 'graphite', label: 'Grafite', description: 'Mais neutro e discreto para o dia a dia.' },
  { id: 'ocean', label: 'Oceano', description: 'Tons frios com destaque mais suave.' },
];

const START_PAGE_OPTIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'cartoes', label: 'Cartões' },
  { id: 'fixas', label: 'Despesas Fixas' },
  { id: 'receitas', label: 'Receitas' },
];

const ToggleRow = ({ label, description, checked, onChange }) => (
  <button type="button" className="settings-toggle-row" onClick={onChange}>
    <div>
      <div className="settings-toggle-title">{label}</div>
      <div className="settings-toggle-description">{description}</div>
    </div>
    <span className={`settings-switch ${checked ? 'active' : ''}`}>
      <span className="settings-switch-knob" />
    </span>
  </button>
);

const SettingsPanel = ({ user, preferences, onPreferenceChange }) => (
  <div className="page-content animate-in">
    <div className="settings-grid">
      <section className="card settings-card">
        <div className="settings-header">
          <div>
            <h3>Sua conta</h3>
            <p>Informações básicas da conta conectada.</p>
          </div>
          <div className="settings-icon"><UserRound size={18} /></div>
        </div>

        <div className="settings-list">
          <div className="settings-row">
            <span>Nome</span>
            <strong>{user.name}</strong>
          </div>
          <div className="settings-row">
            <span>E-mail</span>
            <strong>{user.email}</strong>
          </div>
          <div className="settings-row">
            <span>Sincronização</span>
            <strong>Automática pela conta</strong>
          </div>
        </div>
      </section>

      <section className="card settings-card">
        <div className="settings-header">
          <div>
            <h3>Tela inicial</h3>
            <p>Escolha a área que abre primeiro ao entrar no app.</p>
          </div>
          <div className="settings-icon"><LayoutTemplate size={18} /></div>
        </div>

        <div className="settings-chip-group">
          {START_PAGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`settings-chip ${preferences.startPage === option.id ? 'active' : ''}`}
              onClick={() => onPreferenceChange('startPage', option.id)}
            >
              {preferences.startPage === option.id && <Check size={14} />}
              {option.label}
            </button>
          ))}
        </div>
      </section>
    </div>

    <section className="card settings-card">
      <div className="settings-header">
        <div>
          <h3>Aparência</h3>
          <p>Deixe o app com o estilo que combina mais com seu uso.</p>
        </div>
        <div className="settings-icon"><Palette size={18} /></div>
      </div>

      <div className="settings-theme-grid">
        {THEME_OPTIONS.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`settings-theme-card ${preferences.theme === theme.id ? 'active' : ''} ${theme.id}`}
            onClick={() => onPreferenceChange('theme', theme.id)}
          >
            <div className="settings-theme-preview">
              <span />
              <span />
              <span />
            </div>
            <div className="settings-theme-title">{theme.label}</div>
            <div className="settings-theme-description">{theme.description}</div>
          </button>
        ))}
      </div>
    </section>

    <section className="card settings-card">
      <div className="settings-header">
        <div>
          <h3>Preferências de uso</h3>
          <p>Ajustes simples para deixar a visualização mais confortável.</p>
        </div>
        <div className="settings-icon"><MonitorCog size={18} /></div>
      </div>

      <div className="settings-toggle-group">
        <ToggleRow
          label="Modo compacto"
          description="Reduz espaços e deixa as informações mais densas na tela."
          checked={preferences.compactMode}
          onChange={() => onPreferenceChange('compactMode', !preferences.compactMode)}
        />

        <ToggleRow
          label="Mostrar saldo na lateral"
          description="Exibe o card de saldo e totais no menu lateral."
          checked={preferences.showBalanceWidget}
          onChange={() => onPreferenceChange('showBalanceWidget', !preferences.showBalanceWidget)}
        />
      </div>
    </section>
  </div>
);

export default SettingsPanel;
