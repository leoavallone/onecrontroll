import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { CATEGORIES, CARDS } from '../data';

const TransactionModal = ({ transaction, onClose, onSave }) => {
  const isEditing = !!transaction?.id;
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    type: transaction?.type || 'expense',
    name: transaction?.name || '',
    amount: transaction?.amount || '',
    category: transaction?.category || 'outros',
    date: transaction?.date || today,
    note: transaction?.note || '',
    card: transaction?.card || '',
    // Installment fields (only used when category === 'parcelamento')
    installments: transaction?.installmentTotal || '',
    installmentStart: transaction?.installmentCurrent || 1,
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const isCardExpense = form.type === 'card_expense';
  const isInstallment = form.category === 'parcelamento';

  const handleSave = () => {
    if (!form.name.trim() || !form.amount || !form.date) return;
    if (form.type === 'card_expense' && !form.card) {
      alert('Selecione o cartão.');
      return;
    }

    const base = {
      ...transaction,
      ...form,
      amount: parseFloat(String(form.amount).replace(',', '.')),
      id: transaction?.id || `t${Date.now()}`,
      baseName: form.name,
    };

    onSave(base);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Tipo */}
        <div className="form-group">
          <label>Tipo</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              className={`type-btn ${form.type === 'income' ? 'active-income' : ''}`}
              onClick={() => set('type', 'income')}
            >
              <TrendingUp size={15} /> Receita
            </button>
            <button
              className={`type-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
              onClick={() => set('type', 'expense')}
            >
              <TrendingDown size={15} /> Despesa
            </button>
            <button
              className={`type-btn ${form.type === 'card_expense' ? 'active-card' : ''}`}
              onClick={() => set('type', 'card_expense')}
            >
              <CreditCard size={15} /> Cartão
            </button>
          </div>
        </div>

        {/* Card selector */}
        {isCardExpense && (
          <div className="form-group">
            <label>Qual cartão?</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {CARDS.map((c) => (
                <button
                  key={c.id}
                  className="type-btn"
                  style={form.card === c.id ? {
                    borderColor: c.color,
                    background: `${c.color}18`,
                    color: c.color,
                  } : {}}
                  onClick={() => set('card', c.id)}
                >
                  <CreditCard size={15} /> {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nome */}
        <div className="form-group">
          <label>Descrição *</label>
          <input
            className="form-control"
            placeholder="Ex: Gasolina, Spotify, Salário..."
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        {/* Valor e Data */}
        <div className="form-row">
          <div className="form-group">
            <label>Valor (R$) *</label>
            <input
              className="form-control"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Data da 1ª parcela *</label>
            <input
              className="form-control"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="form-group">
          <label>Categoria</label>
          <select
            className="form-control"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.filter((c) =>
              form.type === 'income'
                ? ['salario', 'freelance', 'outros'].includes(c.id)
                : !['salario', 'freelance'].includes(c.id)
            ).map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>

        {/* Installment fields — shown when parcelamento is selected */}
        {isInstallment && !isEditing && (
          <div
            style={{
              background: 'rgba(192, 132, 252, 0.07)',
              border: '1px solid rgba(192, 132, 252, 0.2)',
              borderRadius: 10,
              padding: '1rem',
              marginBottom: '1.1rem',
            }}
          >
            <p style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600, marginBottom: '0.75rem' }}>
              📦 Configuração de Parcelamento
            </p>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Total de parcelas *</label>
                <input
                  className="form-control"
                  type="number"
                  min="2"
                  max="60"
                  placeholder="Ex: 12"
                  value={form.installments}
                  onChange={(e) => set('installments', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Começa na parcela nº</label>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.installmentStart}
                  onChange={(e) => set('installmentStart', e.target.value)}
                />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
              💡 O sistema criará uma entrada para cada mês automaticamente. Exclua as parcelas já pagas.
            </p>
          </div>
        )}

        {/* Observação */}
        <div className="form-group">
          <label>Observação</label>
          <input
            className="form-control"
            placeholder="Opcional..."
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {isEditing ? 'Salvar alterações' : isInstallment && form.installments > 1 ? `Gerar ${form.installments} parcelas` : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
