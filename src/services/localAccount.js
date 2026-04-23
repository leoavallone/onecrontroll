import { DEFAULT_CARDS, INITIAL_TRANSACTIONS } from '../data';

export const getTransactionsStorageKey = (userId) => `financas_txs_${userId}`;
export const getCardsStorageKey = (userId) => `financas_cards_${userId}`;

export const loadLocalTransactions = (userId) => {
  try {
    const stored = localStorage.getItem(getTransactionsStorageKey(userId));
    if (stored) return JSON.parse(stored);
    if (userId === 'u1') return INITIAL_TRANSACTIONS;
    return [];
  } catch {
    return [];
  }
};

export const loadLocalCards = (userId) => {
  try {
    const stored = localStorage.getItem(getCardsStorageKey(userId));
    if (stored) return JSON.parse(stored);
    return DEFAULT_CARDS;
  } catch {
    return DEFAULT_CARDS;
  }
};

export const persistLocalBackup = (userId, transactions, cards) => {
  localStorage.setItem(getTransactionsStorageKey(userId), JSON.stringify(transactions));
  localStorage.setItem(getCardsStorageKey(userId), JSON.stringify(cards));
};
