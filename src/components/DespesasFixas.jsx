import React, { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import TransactionModal from './TransactionModal';
import TransactionTable from './TransactionTable';
import { CATEGORIES } from '../data';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DespesasFixas = ({ transactions, onAdd, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const fixedCategories = ['assinaturas', 'moradia', 'saude', 'educacao', 'outros'];
  
  const fixedTransactions = transactions.filter(
    (t) => t.type === 'expense' && !['cartao', 'parcelamento'].includes(t.category)
  );

  const filtered = filterCat === 'all'
    ? fixedTransactions
    : fixedTransactions.filter((t) => t.category === filterCat);

  const total = fixedTransactions.reduce((s, t) => s + t.amount, 0);

  // Group by category for summary
  const byCat = fixedCategories.map((catId) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    const items = fixedTransactions.filter((t) => t.category === catId);
    return {
      ...cat,
      total: items.reduce((s, t) => s + t.amount, 0),
      count: items.length,
    };
  }).filter((c) => c.count > 0);

  return (
    <div className="page-content animate-in">
      {/* Summary */}
      <div className="summary-grid">
        <div className="summary-card" style={{ borderColor: 'rgba(255,210,0,0.3)' }}>
          <div className="label">
            <span>Total Despesas Fixas</span>
            <Receipt size={18} color="var(--yellow)" />
          </div>
          <div className="value value-red">{fmt(total)}</div>
          <div className="sublabel">{fixedTransactions.length} despesas fixas</div>
        </div>
        {byCat.map((c) => (
          <div key={c.id} className="summary-card">
            <div className="label">
              <span>{c.emoji} {c.label}</span>
            </div>
            <div className="value" style={{ fontSize: '1.5rem' }}>{fmt(c.total)}</div>
            <div className="sublabel">{c.count} lançamentos</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="section-header">
          <h3>Despesas Fixas e Recorrentes</h3>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Adicionar
          </button>
        </div>

        <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
          <button className={`filter-chip ${filterCat === 'all' ? 'active' : ''}`} onClick={() => setFilterCat('all')}>Todas</button>
          {fixedCategories.map((catId) => {
            const cat = CATEGORIES.find((c) => c.id === catId);
            return (
              <button key={catId} className={`filter-chip ${filterCat === catId ? 'active' : ''}`} onClick={() => setFilterCat(catId)}>
                {cat.emoji} {cat.label}
              </button>
            );
          })}
        </div>

        <TransactionTable
          transactions={filtered}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {showModal && (
        <TransactionModal
          transaction={{ type: 'expense', category: 'outros' }}
          onClose={() => setShowModal(false)}
          onSave={onAdd}
        />
      )}
    </div>
  );
};

export default DespesasFixas;
