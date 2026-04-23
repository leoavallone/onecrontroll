import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Plus, TrendingDown, TrendingUp, CreditCard, DollarSign, Package } from 'lucide-react';
import TransactionModal from './TransactionModal';
import TransactionTable from './TransactionTable';
import { CATEGORIES, getCategoryById } from '../data';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PIE_COLORS = {
  assinaturas: '#4f8ef7',
  alimentacao: '#fb923c',
  transporte: '#f0b429',
  saude: '#10b981',
  educacao: '#a78bfa',
  moradia: '#94a3b8',
  lazer: '#f59e0b',
  parcelamento: '#c084fc',
  compras: '#2dd4bf',
  outros: '#64748b',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#13131f', border: '1px solid rgba(240,180,41,0.2)',
        borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem',
      }}>
        <p style={{ color: '#7a7f9a', marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 700 }}>
            {p.dataKey === 'income' ? '↑ Receitas: ' : '↓ Despesas: '}{fmt(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const Dashboard = ({ transactions, selectedYear, selectedMonth, onAdd, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const totalIncome = useMemo(() =>
    transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);

  const totalExpense = useMemo(() =>
    transactions.filter((t) => t.type === 'expense' || t.type === 'card_expense').reduce((s, t) => s + t.amount, 0), [transactions]);

  const cardTotal = useMemo(() =>
    transactions.filter((t) => t.type === 'card_expense').reduce((s, t) => s + t.amount, 0), [transactions]);

  const installmentTotal = useMemo(() =>
    transactions.filter((t) => t.type === 'card_expense' && t.category === 'parcelamento').reduce((s, t) => s + t.amount, 0), [transactions]);

  const balance = totalIncome - totalExpense;

  const pieData = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'expense' || t.type === 'card_expense')
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([cat, value]) => ({
      name: getCategoryById(cat).label, value, cat,
    }));
  }, [transactions]);

  const chartData = useMemo(() => {
    const months = {};
    transactions.forEach((t) => {
      const d = new Date(t.date + 'T00:00:00');
      const key = `${MONTH_LABELS[d.getMonth()]}/${d.getFullYear()}`;
      if (!months[key]) months[key] = { name: MONTH_LABELS[d.getMonth()], income: 0, expense: 0 };
      if (t.type === 'income') months[key].income += t.amount;
      else months[key].expense += t.amount;
    });
    return Object.values(months);
  }, [transactions]);

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    if (filter === 'income') return transactions.filter((t) => t.type === 'income');
    if (filter === 'expense') return transactions.filter((t) => t.type === 'expense' || t.type === 'card_expense');
    return transactions.filter((t) => t.category === filter);
  }, [transactions, filter]);

  return (
    <div className="page-content animate-in">
      {/* ── Summary Cards ── */}
      <div className="summary-grid">
        <div className={`summary-card c-${balance >= 0 ? 'teal' : 'rose'}`}>
          <div className="sc-label">
            Saldo do Mês
            <div className={`sc-icon ${balance >= 0 ? 'teal' : 'rose'}`}><DollarSign size={16} /></div>
          </div>
          <div className={`sc-value ${balance >= 0 ? 'green' : 'red'}`}>{fmt(Math.abs(balance))}</div>
          <div className="sc-sub">{balance >= 0 ? '✅ Positivo' : '⚠️ Negativo'}</div>
        </div>

        <div className="summary-card c-blue">
          <div className="sc-label">
            Receitas
            <div className="sc-icon green"><TrendingUp size={16} /></div>
          </div>
          <div className="sc-value green">{fmt(totalIncome)}</div>
          <div className="sc-sub">{transactions.filter(t => t.type === 'income').length} lançamentos</div>
        </div>

        <div className="summary-card c-rose">
          <div className="sc-label">
            Despesas Totais
            <div className="sc-icon rose"><TrendingDown size={16} /></div>
          </div>
          <div className="sc-value red">{fmt(totalExpense)}</div>
          <div className="sc-sub">{transactions.filter(t => t.type === 'expense' || t.type === 'card_expense').length} lançamentos</div>
        </div>

        <div className="summary-card c-gold">
          <div className="sc-label">
            Faturas dos Cartões
            <div className="sc-icon gold"><CreditCard size={16} /></div>
          </div>
          <div className="sc-value gold">{fmt(cardTotal)}</div>
          <div className="sc-sub">{transactions.filter(t => t.type === 'card_expense').length} itens nos cartões</div>
        </div>

        {installmentTotal > 0 && (
          <div className="summary-card c-violet">
            <div className="sc-label">
              Parcelamentos
              <div className="sc-icon violet"><Package size={16} /></div>
            </div>
            <div className="sc-value violet">{fmt(installmentTotal)}</div>
            <div className="sc-sub">{transactions.filter(t => t.category === 'parcelamento').length} parcelas ativas</div>
          </div>
        )}
      </div>

      {/* ── Charts ── */}
      <div className="charts-grid">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>📈 Visão Mensal</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#3e4260" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis stroke="#3e4260" axisLine={false} tickLine={false} fontSize={11} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gIncome)" dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#gExpense)" dot={{ fill: '#f43f5e', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>🍩 Despesas por Categoria</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="42%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {pieData.map((entry) => (
                    <Cell key={entry.cat} fill={PIE_COLORS[entry.cat] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => fmt(v)}
                  contentStyle={{ background: '#13131f', border: '1px solid #333', borderRadius: 10, fontSize: '0.8rem' }}
                />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '0.72rem', color: '#7a7f9a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Transactions ── */}
      <div className="card">
        <div className="section-header">
          <h3>Lançamentos de {MONTH_LABELS[(selectedMonth || 1) - 1]}/{selectedYear}</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Novo Lançamento
          </button>
        </div>

        <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'income', label: '📈 Receitas' },
            { key: 'expense', label: '📉 Despesas' },
            ...CATEGORIES.map((c) => ({ key: c.id, label: `${c.emoji} ${c.label}` })),
          ].map((f) => (
            <button key={f.key} className={`filter-chip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        <TransactionTable transactions={filtered} onEdit={onEdit} onDelete={onDelete} />
      </div>

      {showModal && (
        <TransactionModal transaction={null} onClose={() => setShowModal(false)} onSave={onAdd} />
      )}
    </div>
  );
};

export default Dashboard;
