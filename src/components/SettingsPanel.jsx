import React from 'react';
import { CheckCircle2, Cloud, Database, HardDrive, RefreshCcw, TriangleAlert, UserRound } from 'lucide-react';

const SettingsPanel = ({
  user,
  syncState,
  cloudStatus,
  onSyncNow,
  onImportLocalData,
}) => {
  const isCloudAccount = user?.storageMode === 'cloud';

  return (
    <div className="page-content animate-in">
      <div className="settings-grid">
        <section className="card settings-card">
          <div className="settings-header">
            <div>
              <h3>Conta</h3>
              <p>Informações da conta conectada neste momento.</p>
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
              <span>Modo de armazenamento</span>
              <strong>{isCloudAccount ? 'Nuvem' : 'Local'}</strong>
            </div>
          </div>
        </section>

        <section className="card settings-card">
          <div className="settings-header">
            <div>
              <h3>Sincronização</h3>
              <p>Status da persistência entre dispositivos.</p>
            </div>
            <div className="settings-icon"><Cloud size={18} /></div>
          </div>

          <div className={`settings-banner ${syncState.error ? 'danger' : isCloudAccount ? 'success' : 'warning'}`}>
            {syncState.error ? <TriangleAlert size={16} /> : isCloudAccount ? <CheckCircle2 size={16} /> : <HardDrive size={16} />}
            <span>{syncState.error || cloudStatus.message}</span>
          </div>

          <div className="settings-list">
            <div className="settings-row">
              <span>Última sincronização</span>
              <strong>{syncState.lastSyncedAt ? new Date(syncState.lastSyncedAt).toLocaleString('pt-BR') : 'Ainda não sincronizado'}</strong>
            </div>
            <div className="settings-row">
              <span>Estado atual</span>
              <strong>{syncState.loading ? 'Sincronizando...' : syncState.pending ? 'Alterações pendentes' : 'Em dia'}</strong>
            </div>
          </div>

          <div className="settings-actions">
            <button className="btn btn-primary" onClick={onSyncNow} disabled={!isCloudAccount || syncState.loading}>
              <RefreshCcw size={16} /> Sincronizar agora
            </button>
            <button className="btn btn-ghost" onClick={onImportLocalData} disabled={!isCloudAccount || syncState.loading}>
              <Database size={16} /> Importar backup local
            </button>
          </div>
        </section>
      </div>

      <section className="card settings-card">
        <div className="settings-header">
          <div>
            <h3>Como ativar o banco de dados</h3>
            <p>Checklist rápido para deixar a conta disponível no computador, celular e tablet.</p>
          </div>
          <div className="settings-icon"><Database size={18} /></div>
        </div>

        <div className="settings-checklist">
          <div>1. Crie um projeto no Supabase e habilite o Auth por e-mail/senha.</div>
          <div>2. Rode o SQL do arquivo <code>supabase/schema.sql</code> para criar a tabela com segurança por conta.</div>
          <div>3. Adicione <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no ambiente do Vite/Render.</div>
          <div>4. Faça login com a mesma conta em qualquer dispositivo para enxergar os mesmos lançamentos.</div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPanel;
