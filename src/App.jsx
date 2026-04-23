import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, CreditCard, Receipt, TrendingUp,
  Settings, LogOut, Wallet, Plus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Cartoes from './components/Cartoes';
import DespesasFixas from './components/DespesasFixas';
import TransactionTable from './components/TransactionTable';
import TransactionModal from './components/TransactionModal';
import Login from './components/Login';
import { INITIAL_TRANSACTIONS, generateInstallments, DEFAULT_CARDS } from './data';
import { loadSession, clearSession } from './auth';
import roqiaLogo from './assets/roqia_logo.png';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const inMonth = (tx, year, month) => {
  if (!tx.date) return false;
  const d = new Date(tx.date + 'T00:00:00');
  return d.getFullYear() === year && d.getMonth() + 1 === month;
};

function App() {
  // ── Auth ──
  const [user, setUser] = useState(() => loadSession());

  const handleLogin = (loggedUser) => setUser(loggedUser);
  const handleLogout = () => { clearSession(); setUser(null); };

  const loadUserTransactions = (userId) => {
    try {
      const stored = localStorage.getItem(`financas_txs_${userId}`);
      if (stored) return JSON.parse(stored);
      if (userId === 'u1') return INITIAL_TRANSACTIONS;
      return [];
    } catch {
      return [];
    }
  };

  const loadUserCards = (userId) => {
    try {
      const stored = localStorage.getItem(`financas_cards_${userId}`);
      if (stored) return JSON.parse(stored);
      return DEFAULT_CARDS;
    } catch {
      return DEFAULT_CARDS;
    }
  };

  // ── State ──
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState(() => user ? loadUserTransactions(user.id) : []);
  const [cards, setCards] = useState(() => user ? loadUserCards(user.id) : []);

  useEffect(() => {
    if (user) {
      setTransactions(loadUserTransactions(user.id));
      setCards(loadUserCards(user.id));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`financas_txs_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`financas_cards_${user.id}`, JSON.stringify(cards));
    }
  }, [cards, user]);
  const [editingTx, setEditingTx] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newModalDefaults, setNewModalDefaults] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(5);

  const prevMonth = () => {
    if (selectedMonth === 1) { setSelectedYear(y => y - 1); setSelectedMonth(12); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 12) { setSelectedYear(y => y + 1); setSelectedMonth(1); }
    else setSelectedMonth(m => m + 1);
  };

  // ── Filtered by month ──
  const monthTransactions = useMemo(
    () => transactions.filter((tx) => inMonth(tx, selectedYear, selectedMonth)),
    [transactions, selectedYear, selectedMonth]
  );

  // ── CRUD ──
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
    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
    setEditingTx(null);
  };

  const handleDelete = (id) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    if (tx.installmentGroup && tx.installmentTotal > 1) {
      const remaining = transactions.filter(
        (t) => t.installmentGroup === tx.installmentGroup && t.installmentCurrent >= tx.installmentCurrent
      );
      if (remaining.length > 1) {
        const onlyThis = window.confirm(
          `Parcela ${tx.installmentCurrent}/${tx.installmentTotal}: "${tx.name.replace(/ \(\d+\/\d+\)/, '')}"\n\n` +
          `OK → Excluir só esta parcela\nCancelar → Excluir esta e as ${remaining.length - 1} restantes`
        );
        if (onlyThis) {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
        } else {
          const toDelete = new Set(remaining.map((t) => t.id));
          setTransactions((prev) => prev.filter((t) => !toDelete.has(t.id)));
        }
        return;
      }
    }

    if (window.confirm('Deseja excluir este lançamento?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleAddCard = (newCard) => {
    setCards(prev => [...prev, newCard]);
  };

  const handleDeleteCard = (cardId) => {
    if(window.confirm('Tem certeza que deseja excluir este cartão permanentemente?')) {
      setCards(prev => prev.filter(c => c.id !== cardId));
    }
  };

  const openNew = (defaults = {}) => {
    setNewModalDefaults(defaults);
    setShowNewModal(true);
  };

  // ── Sidebar totals ──
  const totalIncome = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTransactions.filter((t) => t.type === 'expense' || t.type === 'card_expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { key: 'cartoes', label: 'Cartões', icon: <CreditCard size={17} /> },
    { key: 'fixas', label: 'Despesas Fixas', icon: <Receipt size={17} /> },
    { key: 'receitas', label: 'Receitas', icon: <TrendingUp size={17} /> },
  ];

  const PAGE_TITLES = {
    dashboard: { title: 'Dashboard', sub: 'Visão geral das suas finanças' },
    cartoes: { title: 'Cartões de Crédito', sub: 'Faturas e lançamentos por cartão' },
    fixas: { title: 'Despesas Fixas', sub: 'Contas e assinaturas recorrentes' },
    receitas: { title: 'Receitas', sub: 'Salários, freelances e outras entradas' },
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

  // ── Show Login if not authenticated ──
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-container">
      {/* ════ SIDEBAR ════ */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-main">
            <img src={roqiaLogo} alt="RoqIA Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            One controll
          </div>
          <div className="tagline">from RoqIA</div>
        </div>

        <span className="nav-section-label">Navegação</span>
        {navItems.map((item) => (
          <div
            key={item.key}
            className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => setActiveTab(item.key)}
          >
            {item.icon}{item.label}
          </div>
        ))}

        {/* Balance widget */}
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
          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', marginBottom: 4,
          }}>
            <div className="user-avatar">{user.initials}</div>
            <div>
              <p style={{ fontSize: '0.83rem', fontWeight: 600 }}>{user.name}</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>

          <span className="nav-section-label">Sistema</span>
          <div className="nav-item"><Settings size={17} /> Configurações</div>
          <div
            className="nav-item"
            style={{ color: 'var(--danger)' }}
            onClick={handleLogout}
          >
            <LogOut size={17} /> Sair
          </div>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title">
            <h2>{PAGE_TITLES[activeTab]?.title}</h2>
            <p>{PAGE_TITLES[activeTab]?.sub}</p>
          </div>

          <div className="topbar-actions">
            {/* Month Navigator */}
            <div className="month-picker">
              <button onClick={prevMonth}><ChevronLeft size={15} /></button>
              <span>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
              <button onClick={nextMonth}><ChevronRight size={15} /></button>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => openNew()}>
              <Plus size={14} /> Lançamento
            </button>
          </div>
        </div>

        {/* Pages */}
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
                <div className="sc-sub">{monthTransactions.filter((t) => t.type === 'income').length} lançamentos</div>
              </div>
            </div>

            <div className="card">
              <div className="section-header">
                <h3>Receitas de {MONTH_NAMES[selectedMonth - 1]}/{selectedYear}</h3>
                <button className="btn btn-primary btn-sm" onClick={() => openNew({ type: 'income', category: 'salario' })}>
                  <Plus size={14} /> Nova Receita
                </button>
              </div>
              <TransactionTable
                transactions={monthTransactions.filter((t) => t.type === 'income')}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}
      </main>

      {/* ════ MODALS ════ */}
      {showNewModal && (
        <TransactionModal
          transaction={newModalDefaults}
          cards={cards}
          onClose={() => { setShowNewModal(false); setNewModalDefaults(null); }}
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
