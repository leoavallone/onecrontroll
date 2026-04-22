import React from 'react';
import { TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import { getCategoryById } from '../data';

const fmt = (val) =>
  val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CategoryBadge = ({ categoryId }) => {
  const cat = getCategoryById(categoryId);
  return (
    <span className={`badge badge-${cat.color}`}>
      {cat.emoji} {cat.label}
    </span>
  );
};

const TransactionTable = ({ transactions, onEdit, onDelete }) => {
  if (!transactions.length) {
    return (
      <div className="empty-state">
        <p>Nenhum lançamento encontrado.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>Observação</th>
            <th style={{ textAlign: 'right' }}>Valor</th>
            <th style={{ textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>
                {tx.type === 'income' ? (
                  <TrendingUp size={18} color="var(--success)" />
                ) : (
                  <TrendingDown size={18} color="var(--danger)" />
                )}
              </td>
              <td style={{ fontWeight: 500 }}>{tx.name}</td>
              <td>
                <CategoryBadge categoryId={tx.category} />
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>
                {new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {tx.note || '—'}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  fontWeight: 700,
                  color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)',
                }}
              >
                {tx.type === 'income' ? '+' : '-'}
                {fmt(tx.amount)}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button className="btn-icon edit" onClick={() => onEdit(tx)} title="Editar">
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => onDelete(tx.id)}
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
