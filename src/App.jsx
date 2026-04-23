import React, { useCallback, useMemo, useState } from 'react';
import {
  LayoutDashboard, CreditCard, Receipt, TrendingUp,
  Settings, LogOut, Plus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Cartoes from './components/Cartoes';
import DespesasFixas from './components/DespesasFixas';
import TransactionTable from './components/TransactionTable';
import TransactionModal from './components/TransactionModal';
import Login from './components/Login';
import SettingsPanel from './components/SettingsPanel';
import { generateInstallments } from './data';
import { loadSession, clearSession, saveSession } from './auth';
import { getCloudConfigStatus } from './cloud';
import { useAccountData } from './hooks/useAccountData';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const today = new Date();
const DEFAULT_YEAR = today.getFullYear();
const DEFAULT_MONTH = today.getMonth() + 1;

const inMonth = (tx, year, month) => {
  if (!tx.date) return false;
  const d = new Date(`${tx.date}T00:00:00`);
  return d.getFullYear() === year && d.getMonth() + 1 === month;
};

function App() {
  const [user, setUser] = useState(() => loadSession());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingTx, setEditingTx] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newModalDefaults, setNewModalDefaults] = useState(null);
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULT_MONTH);
  const handleSessionUpdate = useCallback((updatedUser) => {
    setUser(updatedUser);
    saveSession(updatedUser);
  }, []);

  const cloudStatus = getCloudConfigStatus();
  const isFinancialTab = activeTab !== 'settings';
  const {
    transactions,
    setTransactions,
    cards,
    setCards,
    hydrated,
    loadingData,
    syncState,
    syncNow,
    importLocalData,
  } = useAccountData({
    user,
    onSessionUpdate: handleSessionUpdate,
  });

  const handleLogin = (loggedUser) => setUser(loggedUser);
  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear((year) => year - 1);
      setSelectedMonth(12);
      return;
    }

    setSelectedMonth((month) => month - 1);
  };

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear((year) => year + 1);
      setSelectedMonth(1);
      return;
    }

    setSelectedMonth((month) => month + 1);
  };

  const monthTransactions = useMemo(
    () => transactions.filter((tx) => inMonth(tx, selectedYear, selectedMonth)),
    [transactions, selectedYear, selectedMonth]
  );

  const handleAdd = (tx) => {
    if (tx.category === 'parcelamento' && parseInt(tx.installments, 10) > 1) {
      const entries = generateInstallments({ ...tx, installmentGroup: `grp_${Date.now()}` });
      setTransactions((prev) => [...prev, ...entries]);
    } else {
      setTransactions((prev) => [...prev, { ...tx, id: tx.id || `t${Date.now()}` }]);
    }

    setShowNewModal(false);
    setNewModalDefaults(null);
  };

  const handleEdit = (tx) => setEditingTx(tx);

  const handleSaveEdit = (tx) => {
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)));
    setEditingTx(null);
  };

  const handleDelete = (id) => {
    const tx = transactions.find((item) => item.id === id);
    if (!tx) return;

    if (tx.installmentGroup && tx.installmentTotal > 1) {
      const remaining = transactions.filter(
        (item) => item.installmentGroup === tx.installmentGroup && item.installmentCurrent >= tx.installmentCurrent
      );

      if (remaining.length > 1) {
        const onlyThis = window.confirm(
          `Parcela ${tx.installmentCurrent}/${tx.installmentTotal}: "${tx.name.replace(/ \(\d+\/\d+\)/, '')}"\n\n`
          + `OK -> Excluir só esta parcela\nCancelar -> Excluir esta e as ${remaining.length - 1} restantes`
        );

        if (onlyThis) {
          setTransactions((prev) => prev.filter((item) => item.id !== id));
        } else {
          const toDelete = new Set(remaining.map((item) => item.id));
          setTransactions((prev) => prev.filter((item) => !toDelete.has(item.id)));
        }
        return;
      }
    }

    if (window.confirm('Deseja excluir este lançamento?')) {
      setTransactions((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleAddCard = (newCard) => {
    setCards((prev) => [...prev, newCard]);
  };

  const handleDeleteCard = (cardId) => {
    if (window.confirm('Tem certeza que deseja excluir este cartão permanentemente?')) {
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    }
  };

  const openNew = (defaults = {}) => {
    setNewModalDefaults(defaults);
    setShowNewModal(true);
  };

  const totalIncome = monthTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = monthTransactions
    .filter((item) => item.type === 'expense' || item.type === 'card_expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { key: 'cartoes', label: 'Cartões', icon: <CreditCard size={17} /> },
    { key: 'fixas', label: 'Despesas Fixas', icon: <Receipt size={17} /> },
    { key: 'receitas', label: 'Receitas', icon: <TrendingUp size={17} /> },
    { key: 'settings', label: 'Configurações', icon: <Settings size={17} /> },
  ];

  const pageTitles = {
    dashboard: { title: 'Dashboard', sub: 'Visão geral das suas finanças' },
    cartoes: { title: 'Cartões de Crédito', sub: 'Faturas e lançamentos por cartão' },
    fixas: { title: 'Despesas Fixas', sub: 'Contas e assinaturas recorrentes' },
    receitas: { title: 'Receitas', sub: 'Salários, freelances e outras entradas' },
    settings: { title: 'Configurações', sub: 'Conta, sincronização e banco de dados' },
  };

  const pageProps = {
    transactions: monthTransactions,
    allTransactions: transactions,
    selectedYear,
    selectedMonth,
    cards,
    onAdd: handleAdd,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onAddCard: handleAddCard,
    onDeleteCard: handleDeleteCard,
  };

  if (!user) return <Login onLogin={handleLogin} />;

  if (loadingData && !hydrated) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand-wrapper">
            <div className="login-brand">One controll</div>
            <div className="tagline" style={{ marginLeft: '4px', marginBottom: '1.5rem' }}>from RoqIA</div>
          </div>
          <p className="login-subtitle">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-main">One controll</div>
          <div className="tagline">from RoqIA</div>
        </div>

        <span className="nav-section-label">Navegação</span>
        {navItems.map((item) => (
          <div
            key={item.key}
            className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => setActiveTab(item.key)}
          >
            {item.icon}
            {item.label}
          </div>
        ))}

        <div className="balance-widget">
          <div className="bw-label">Saldo — {MONTH_NAMES[selectedMonth - 1]}</div>
          <div className="bw-value" style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {fmt(Math.abs(balance))}
          </div>
          <div className="bw-breakdown">
            <span className="bw-income">↑ {fmt(totalIncome)}</span>
            <span className="bw-expense">↓ {fmt(totalExpense)}</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 4 }}>
            <div className="user-avatar">{user.initials}</div>
            <div>
              <p style={{ fontSize: '0.83rem', fontWeight: 600 }}>{user.name}</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>

          <span className="nav-section-label">Sistema</span>
          <div
            className="nav-item"
            style={{ color: 'var(--danger)' }}
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Sair
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            <h2>{pageTitles[activeTab]?.title}</h2>
            <p>{pageTitles[activeTab]?.sub}</p>
          </div>

          {isFinancialTab && (
            <div className="topbar-actions">
              <div className="month-picker">
                <button onClick={prevMonth}><ChevronLeft size={15} /></button>
                <span>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
                <button onClick={nextMonth}><ChevronRight size={15} /></button>
              </div>

              <button className="btn btn-primary btn-sm" onClick={() => openNew()}>
                <Plus size={14} />
                Lançamento
              </button>
            </div>
          )}
        </div>

        {activeTab === 'dashboard' && <Dashboard {...pageProps} />}
        {activeTab === 'cartoes' && <Cartoes {...pageProps} />}
        {activeTab === 'fixas' && <DespesasFixas {...pageProps} />}

        {activeTab === 'receitas' && (
          <div className="page-content animate-in">
            <div className="summary-grid">
              <div className="summary-card c-blue">
                <div className="sc-label">
                  Total de Receitas — {MONTH_NAMES[selectedMonth - 1]}
                  <div className="sc-icon green"><TrendingUp size={16} /></div>
                </div>
                <div className="sc-value green">{fmt(totalIncome)}</div>
                <div className="sc-sub">{monthTransactions.filter((item) => item.type === 'income').length} lançamentos</div>
              </div>
            </div>

            <div className="card">
              <div className="section-header">
                <h3>Receitas de {MONTH_NAMES[selectedMonth - 1]}/{selectedYear}</h3>
                <button className="btn btn-primary btn-sm" onClick={() => openNew({ type: 'income', category: 'salario' })}>
                  <Plus size={14} />
                  Nova Receita
                </button>
              </div>
              <TransactionTable
                transactions={monthTransactions.filter((item) => item.type === 'income')}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            user={user}
            syncState={syncState}
            cloudStatus={cloudStatus}
            onSyncNow={syncNow}
            onImportLocalData={importLocalData}
          />
        )}
      </main>

      {showNewModal && (
        <TransactionModal
          transaction={newModalDefaults}
          cards={cards}
          onClose={() => {
            setShowNewModal(false);
            setNewModalDefaults(null);
          }}
          onSave={handleAdd}
        />
      )}

      {editingTx && (
        <TransactionModal
          transaction={editingTx}
          cards={cards}
          onClose={() => setEditingTx(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

export default App;
