import React, { useState, useMemo } from 'react';
import { Plus, CreditCard, ChevronDown, ChevronUp, Package, Trash2 } from 'lucide-react';
import TransactionModal from './TransactionModal';
import TransactionTable from './TransactionTable';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

const CardPanel = ({ card, items, cards, onAdd, onEdit, onDelete, onDeleteCard }) => {
  const [open, setOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const total = items.reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${card.color}33`,
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Card Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: card.gradient,
          borderBottom: `1px solid ${card.color}22`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${card.color}22`, border: `1px solid ${card.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CreditCard size={22} color={card.color} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>Cartão {card.name}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {items.length} {items.length === 1 ? 'item' : 'itens'} na fatura
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total da Fatura</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color }}>{fmt(total)}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
            style={{
              background: `${card.color}22`, border: `1px solid ${card.color}44`, color: card.color,
              borderRadius: 10, padding: '8px 14px', fontFamily: 'var(--font)', fontWeight: 600,
              fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <Plus size={15} /> Adicionar item
          </button>
          <div style={{ color: 'var(--text-muted)' }}>
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
            title="Excluir cartão"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Items Table */}
      {open && (
        <div style={{ padding: '0.5rem 0' }}>
          <TransactionTable transactions={items} onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}

      {showModal && (
        <TransactionModal
          transaction={{ type: 'card_expense', card: card.id, category: 'outros' }}
          cards={cards}
          onClose={() => setShowModal(false)}
          onSave={onAdd}
        />
      )}
    </div>
  );
};

const Cartoes = ({ transactions, selectedYear, selectedMonth, cards = [], onAdd, onEdit, onDelete, onAddCard, onDeleteCard }) => {
  const [showModal, setShowModal] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardForm, setNewCardForm] = useState({ name: '', color: '#f59e0b' });

  const handleCreateCard = () => {
    if (!newCardForm.name.trim()) return;
    const newCard = {
      id: `c_${Date.now()}`,
      name: newCardForm.name,
      color: newCardForm.color,
      gradient: `linear-gradient(135deg, #1a1a1a, ${newCardForm.color}20)`,
    };
    onAddCard(newCard);
    setShowAddCard(false);
    setNewCardForm({ name: '', color: '#f59e0b' });
  };

  // Regular card items (non-installment)
  const regularCardItems = transactions.filter(
    (t) => t.type === 'card_expense' && t.category !== 'parcelamento'
  );

  // Installment items for this month
  const installmentItems = transactions.filter(
    (t) => t.type === 'card_expense' && t.category === 'parcelamento'
  );

  const grandTotal = transactions.filter((t) => t.type === 'card_expense').reduce((s, t) => s + t.amount, 0);
  const installmentTotal = installmentItems.reduce((s, t) => s + t.amount, 0);

  const byCard = useMemo(() =>
    cards.map((card) => ({
      card,
      items: regularCardItems.filter((t) => t.card === card.id),
    })),
    [regularCardItems, cards]
  );

  const installmentByCard = useMemo(() =>
    cards.map((card) => ({
      card,
      items: installmentItems.filter((t) => t.card === card.id),
    })).filter(({ items }) => items.length > 0),
    [installmentItems, cards]
  );

  const monthName = MONTH_NAMES[(selectedMonth || 5) - 1];

  return (
    <div className="page-content animate-in">
      {/* Summary */}
      <div className="summary-grid">
        <div className="summary-card" style={{ borderColor: 'rgba(255,210,0,0.3)' }}>
          <div className="label">
            <span>Total Geral — {monthName}</span>
            <CreditCard size={18} color="var(--yellow)" />
          </div>
          <div className="value value-red">{fmt(grandTotal)}</div>
          <div className="sublabel">
            {regularCardItems.length} gastos + {installmentItems.length} parcelas
          </div>
        </div>
        {cards.map((card) => {
          const total = transactions
            .filter((t) => t.type === 'card_expense' && t.card === card.id)
            .reduce((s, t) => s + t.amount, 0);
          return (
            <div key={card.id} className="summary-card">
              <div className="label">
                <span>{card.name}</span>
                <CreditCard size={18} color={card.color} />
              </div>
              <div className="value" style={{ color: card.color, fontSize: '1.6rem' }}>{fmt(total)}</div>
              <div className="sublabel">
                {transactions.filter(t => t.type === 'card_expense' && t.card === card.id).length} itens
              </div>
            </div>
          );
        })}
        {installmentTotal > 0 && (
          <div className="summary-card">
            <div className="label">
              <span>Parcelas deste mês</span>
              <Package size={18} color="#c084fc" />
            </div>
            <div className="value" style={{ color: '#c084fc', fontSize: '1.5rem' }}>{fmt(installmentTotal)}</div>
            <div className="sublabel">{installmentItems.length} parcelas ativas</div>
          </div>
        )}
      </div>

      {/* Regular card spending per card */}
      {byCard.map(({ card, items }) => (
        <CardPanel
          key={card.id}
          card={card}
          items={items}
          cards={cards}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onDeleteCard={onDeleteCard}
        />
      ))}

      {/* Installments section */}
      {installmentItems.length > 0 && (
        <div className="card">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Package size={20} color="#c084fc" />
              <div>
                <h3>📦 Parcelamentos de {monthName}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Exclua as parcelas que já foram pagas/encerradas
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#c084fc', fontWeight: 700, fontSize: '1.1rem' }}>{fmt(installmentTotal)}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{installmentItems.length} parcelas</p>
            </div>
          </div>

          {installmentByCard.map(({ card, items }) => (
            <div key={card.id} style={{ marginBottom: '1rem' }}>
              <p style={{
                fontSize: '0.75rem', fontWeight: 600, color: card.color,
                textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <CreditCard size={13} /> {card.name}
              </p>
              <TransactionTable transactions={items} onEdit={onEdit} onDelete={onDelete} />
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '12px 28px' }}>
          <Plus size={18} /> Adicionar gasto no cartão
        </button>
        <button className="btn btn-ghost" onClick={() => setShowAddCard(true)} style={{ padding: '12px 28px' }}>
          <Plus size={18} /> Novo Cartão
        </button>
      </div>

      {showModal && (
        <TransactionModal
          transaction={{ type: 'card_expense', category: 'outros' }}
          cards={cards}
          onClose={() => setShowModal(false)}
          onSave={onAdd}
        />
      )}

      {showAddCard && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddCard(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Cadastrar Novo Cartão</h3>
              <button className="modal-close" onClick={() => setShowAddCard(false)}>x</button>
            </div>
            <div className="form-group">
              <label>Nome do Cartão *</label>
              <input
                className="form-control"
                placeholder="Ex: Nubank, Inter..."
                value={newCardForm.name}
                onChange={(e) => setNewCardForm({ ...newCardForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Cor *</label>
              <input
                type="color"
                className="form-control"
                value={newCardForm.color}
                onChange={(e) => setNewCardForm({ ...newCardForm, color: e.target.value })}
                style={{ padding: 4, height: 42 }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowAddCard(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreateCard}>Salvar Cartão</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cartoes;
