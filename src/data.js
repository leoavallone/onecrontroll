// Categories with colors and icons
export const CATEGORIES = [
  { id: 'assinaturas', label: 'Assinaturas', color: 'blue', emoji: '📱' },
  { id: 'alimentacao', label: 'Alimentação', color: 'orange', emoji: '🍔' },
  { id: 'transporte', label: 'Transporte', color: 'yellow', emoji: '🚗' },
  { id: 'saude', label: 'Saúde', color: 'green', emoji: '🏥' },
  { id: 'educacao', label: 'Educação', color: 'purple', emoji: '📚' },
  { id: 'moradia', label: 'Moradia', color: 'gray', emoji: '🏠' },
  { id: 'lazer', label: 'Lazer', color: 'orange', emoji: '🎮' },
  { id: 'parcelamento', label: 'Parcelamento', color: 'purple', emoji: '📦' },
  { id: 'salario', label: 'Salário', color: 'green', emoji: '💼' },
  { id: 'freelance', label: 'Freelance', color: 'yellow', emoji: '💰' },
  { id: 'compras', label: 'Compras', color: 'orange', emoji: '🛍️' },
  { id: 'outros', label: 'Outros', color: 'gray', emoji: '📋' },
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

// Cards registered in the system
export const CARDS = [
  { id: 'itau', name: 'Itaú', color: '#f59e0b', gradient: 'linear-gradient(135deg, #1a1a1a, #2a1a00)' },
  { id: 'porto', name: 'Porto Seguro', color: '#ef4444', gradient: 'linear-gradient(135deg, #1a1a1a, #1a0000)' },
];

export const getCardById = (id) => CARDS.find((c) => c.id);

// Helper to add months to a date string (YYYY-MM-DD) → new YYYY-MM-DD
export const addMonths = (dateStr, months) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  // keep same day or clamp to end of month
  return d.toISOString().split('T')[0];
};

// Generate installment entries from a base transaction
// Returns array of transactions (one per installment month)
export const generateInstallments = (baseTx) => {
  const total = parseInt(baseTx.installments, 10);
  const start = parseInt(baseTx.installmentStart || 1, 10);
  const remaining = total - start + 1;
  const groupId = baseTx.installmentGroup || `grp_${Date.now()}`;

  return Array.from({ length: remaining }, (_, i) => ({
    ...baseTx,
    id: `${groupId}_${start + i}`,
    installmentGroup: groupId,
    installmentCurrent: start + i,
    installmentTotal: total,
    name: `${baseTx.baseName || baseTx.name} (${start + i}/${total})`,
    date: addMonths(baseTx.date, i),
    // Remove the "wizard" fields so they don't carry over
    installments: undefined,
    installmentStart: undefined,
    baseName: undefined,
  }));
};

// ====================================================
// INITIAL DATA — extracted from user's spreadsheet
// ====================================================
// Parcelamentos have all future months pre-generated
const INSTALLMENTS_SEED = [
  // ── Notebook Dudu: metade = 2x em Porto (started Abril, ends Maio)
  { groupId: 'grp_notebook', baseName: 'Notebook Dudu', total: 2, card: 'porto', amount: 195.75, category: 'parcelamento', startDate: '2025-04-10' },
  // ── Cadeira: 3x em Porto (started Março, ends Maio)
  { groupId: 'grp_cadeira', baseName: 'Cadeira', total: 3, card: 'porto', amount: 193.9, category: 'parcelamento', startDate: '2025-03-10' },
  // ── Bone Lacoste: 3x (started Março, ends Maio) - Itaú
  { groupId: 'grp_bone', baseName: 'Bone Lacoste', total: 3, card: 'itau', amount: 55.36, category: 'parcelamento', startDate: '2025-03-10' },
  // ── Bike: 5x em Porto (started Janeiro, ends Maio)
  { groupId: 'grp_bike', baseName: 'Bike', total: 5, card: 'porto', amount: 115, category: 'parcelamento', startDate: '2025-01-10' },
  // ── Macbook: 8x em Porto (started Outubro 2024, ends Maio 2025)
  { groupId: 'grp_macbook', baseName: 'Macbook', total: 8, card: 'porto', amount: 290.17, category: 'parcelamento', startDate: '2024-10-10' },
  // ── Curso Alura: 8x em Porto (started Outubro 2024, ends Maio 2025)
  { groupId: 'grp_alura', baseName: 'Curso Alura', total: 8, card: 'porto', amount: 87.99, category: 'parcelamento', startDate: '2024-10-10' },
  // ── Air Fryer: 3x em Porto (started Abril, ends Junho) — still has June left!
  { groupId: 'grp_airfryer', baseName: 'Air Fryer', total: 3, card: 'porto', amount: 58.38, category: 'parcelamento', startDate: '2025-04-10' },
  // ── Ap Praia: 3x em Porto (started Maio, goes to Julho)
  { groupId: 'grp_appraia', baseName: 'Ap Praia', total: 3, card: 'porto', amount: 108.33, category: 'parcelamento', startDate: '2025-05-10' },
  // ── Presentes (mãe e Dani): 4x em Porto (started Maio, ends Agosto)
  { groupId: 'grp_presentes', baseName: 'Presentes (mãe e Dani)', total: 4, card: 'porto', amount: 112.65, category: 'parcelamento', startDate: '2025-05-10' },
  // ── Faculdade: 6x (started Maio, ends Outubro) — ongoing
  { groupId: 'grp_faculdade', baseName: 'Notebook Dudu (metade)', total: 2, card: 'porto', amount: 98, category: 'parcelamento', startDate: '2025-05-10' },
];

// Build all installment transactions
const buildInstallments = () => {
  const result = [];
  INSTALLMENTS_SEED.forEach(({ groupId, baseName, total, card, amount, category, startDate }) => {
    for (let i = 1; i <= total; i++) {
      result.push({
        id: `${groupId}_${i}`,
        type: 'card_expense',
        card,
        name: `${baseName} (${i}/${total})`,
        amount,
        category,
        date: addMonths(startDate, i - 1),
        note: `Parcela ${i} de ${total}`,
        installmentGroup: groupId,
        installmentCurrent: i,
        installmentTotal: total,
      });
    }
  });
  return result;
};

export const INITIAL_TRANSACTIONS = [
  // ── RECEITAS ──
  { id: 'r1', type: 'income', name: 'Salário', amount: 8000, category: 'salario', date: '2025-05-01', note: 'Salário mensal' },

  // ── DESPESAS FIXAS ──
  { id: 'd1', type: 'expense', name: 'Ajuda Bryan', amount: 2283.59, category: 'outros', date: '2025-05-05', note: 'Despesa fixa' },
  { id: 'd2', type: 'expense', name: 'Apple', amount: 99.9, category: 'assinaturas', date: '2025-05-05', note: 'Apple One' },
  { id: 'd3', type: 'expense', name: 'Claro', amount: 98.91, category: 'assinaturas', date: '2025-05-05', note: 'Plano celular' },
  { id: 'd4', type: 'expense', name: 'Compra Supermercado', amount: 1200, category: 'alimentacao', date: '2025-05-05', note: '' },
  { id: 'd5', type: 'expense', name: 'Compromisso (Léo)', amount: 200, category: 'outros', date: '2025-05-05', note: '' },
  { id: 'd6', type: 'expense', name: 'Disney+', amount: 27.99, category: 'assinaturas', date: '2025-05-05', note: 'Streaming' },
  { id: 'd7', type: 'expense', name: 'Faculdade', amount: 197.99, category: 'educacao', date: '2025-05-05', note: '' },
  { id: 'd8', type: 'expense', name: 'Mei', amount: 86.9, category: 'outros', date: '2025-05-05', note: 'Contribuição MEI' },
  { id: 'd9', type: 'expense', name: 'Seguro', amount: 320, category: 'transporte', date: '2025-05-05', note: 'Seguro do carro' },
  { id: 'd10', type: 'expense', name: 'Spotify', amount: 31.9, category: 'assinaturas', date: '2025-05-05', note: '' },

  // ── ITAÚ — Itens individuais (Maio) ──
  { id: 'ci1', type: 'card_expense', card: 'itau', name: 'Mesa', amount: 129.41, category: 'compras', date: '2025-05-01', note: '' },
  { id: 'ci2', type: 'card_expense', card: 'itau', name: 'Perfume Dani', amount: 70.4, category: 'compras', date: '2025-05-02', note: '' },
  { id: 'ci3', type: 'card_expense', card: 'itau', name: 'Chuveiro', amount: 55.66, category: 'moradia', date: '2025-05-03', note: '' },
  { id: 'ci4', type: 'card_expense', card: 'itau', name: 'Hortifruti', amount: 10.99, category: 'alimentacao', date: '2025-05-04', note: '' },
  { id: 'ci5', type: 'card_expense', card: 'itau', name: 'Mercado', amount: 45.6, category: 'alimentacao', date: '2025-05-05', note: '' },
  { id: 'ci6', type: 'card_expense', card: 'itau', name: 'iFood', amount: 68.88, category: 'alimentacao', date: '2025-05-06', note: '' },
  { id: 'ci7', type: 'card_expense', card: 'itau', name: 'iFood', amount: 48.8, category: 'alimentacao', date: '2025-05-08', note: '' },
  { id: 'ci8', type: 'card_expense', card: 'itau', name: 'iFood', amount: 59.99, category: 'alimentacao', date: '2025-05-09', note: '' },
  { id: 'ci9', type: 'card_expense', card: 'itau', name: 'Academia', amount: 140, category: 'saude', date: '2025-05-10', note: '' },
  { id: 'ci10', type: 'card_expense', card: 'itau', name: 'Gasolina', amount: 50, category: 'transporte', date: '2025-05-11', note: '' },
  { id: 'ci11', type: 'card_expense', card: 'itau', name: 'iFood', amount: 128.99, category: 'alimentacao', date: '2025-05-12', note: '' },

  // ── PORTO SEGURO — Itens individuais (Maio) ──
  { id: 'cp1', type: 'card_expense', card: 'porto', name: 'Absoluta', amount: 317.5, category: 'compras', date: '2025-05-01', note: '' },
  { id: 'cp2', type: 'card_expense', card: 'porto', name: 'Adidas Dani', amount: 83.34, category: 'compras', date: '2025-05-01', note: '' },
  { id: 'cp3', type: 'card_expense', card: 'porto', name: 'Academia', amount: 140, category: 'saude', date: '2025-05-01', note: '' },
  { id: 'cp5', type: 'card_expense', card: 'porto', name: 'Alexa', amount: 58.25, category: 'compras', date: '2025-05-01', note: '' },
  { id: 'cp6', type: 'card_expense', card: 'porto', name: 'Apple', amount: 99.9, category: 'assinaturas', date: '2025-05-01', note: '' },
  { id: 'cp9', type: 'card_expense', card: 'porto', name: 'Claro', amount: 98.91, category: 'assinaturas', date: '2025-05-01', note: '' },
  { id: 'cp10', type: 'card_expense', card: 'porto', name: 'Clube Livelo', amount: 51.24, category: 'outros', date: '2025-05-01', note: '' },
  { id: 'cp11', type: 'card_expense', card: 'porto', name: 'Compras', amount: 752.27, category: 'compras', date: '2025-05-01', note: '' },
  { id: 'cp12', type: 'card_expense', card: 'porto', name: 'Deezer', amount: 32.9, category: 'assinaturas', date: '2025-05-01', note: '' },
  { id: 'cp13', type: 'card_expense', card: 'porto', name: 'Disney+', amount: 27.99, category: 'assinaturas', date: '2025-05-01', note: '' },
  { id: 'cp14', type: 'card_expense', card: 'porto', name: 'Estante Industrial', amount: 33.8, category: 'compras', date: '2025-05-01', note: '' },
  { id: 'cp16', type: 'card_expense', card: 'porto', name: 'Google One', amount: 96.9, category: 'assinaturas', date: '2025-05-01', note: '' },
  { id: 'cp17', type: 'card_expense', card: 'porto', name: 'Globoplay', amount: 59.9, category: 'assinaturas', date: '2025-05-01', note: '' },
  { id: 'cp18', type: 'card_expense', card: 'porto', name: 'IPVA', amount: 270, category: 'transporte', date: '2025-05-01', note: '' },
  { id: 'cp19', type: 'card_expense', card: 'porto', name: 'Mercado Livre', amount: 55.39, category: 'compras', date: '2025-05-01', note: '' },
  { id: 'cp20', type: 'card_expense', card: 'porto', name: 'New Balance', amount: 130.08, category: 'compras', date: '2025-05-01', note: '' },
  { id: 'cp22', type: 'card_expense', card: 'porto', name: 'Peça Tcross', amount: 30.5, category: 'transporte', date: '2025-05-01', note: '' },
  { id: 'cp23', type: 'card_expense', card: 'porto', name: 'Powerbank', amount: 30, category: 'compras', date: '2025-05-01', note: '' },
  { id: 'cp24', type: 'card_expense', card: 'porto', name: 'Projetor', amount: 61.3, category: 'compras', date: '2025-05-01', note: '' },

  // ── PARCELAMENTOS (gerados automaticamente) ──
  ...buildInstallments(),
];
