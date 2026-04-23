import { useEffect, useState } from 'react';
import { isCloudEnabled, loadCloudAccountData, saveCloudAccountData } from '../cloud';
import { refreshUserSession } from '../auth';
import { loadLocalCards, loadLocalTransactions, persistLocalBackup } from '../services/localAccount';

const INITIAL_SYNC_STATE = {
  loading: false,
  pending: false,
  lastSyncedAt: null,
  error: '',
};

export const useAccountData = ({ user, onSessionUpdate }) => {
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [syncState, setSyncState] = useState(INITIAL_SYNC_STATE);

  const isCloudAccount = user?.storageMode === 'cloud' && isCloudEnabled;

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCards([]);
      setHydrated(false);
      setLoadingData(false);
      setSyncState(INITIAL_SYNC_STATE);
      return undefined;
    }

    let cancelled = false;

    const hydrateData = async () => {
      setLoadingData(true);
      setHydrated(false);

      const localTransactions = loadLocalTransactions(user.id);
      const localCards = loadLocalCards(user.id);

      if (!isCloudAccount) {
        if (!cancelled) {
          setTransactions(localTransactions);
          setCards(localCards);
          setSyncState(INITIAL_SYNC_STATE);
          setHydrated(true);
          setLoadingData(false);
        }
        return;
      }

      try {
        const activeSession = await refreshUserSession(user);
        if (cancelled) return;
        onSessionUpdate(activeSession);

        const remoteData = await loadCloudAccountData({
          userId: activeSession.id,
          token: activeSession.accessToken,
        });

        if (cancelled) return;

        setTransactions(Array.isArray(remoteData?.transactions) ? remoteData.transactions : localTransactions);
        setCards(Array.isArray(remoteData?.cards) ? remoteData.cards : localCards);
        setSyncState({
          loading: false,
          pending: !remoteData,
          lastSyncedAt: remoteData?.updated_at || null,
          error: '',
        });
      } catch (error) {
        if (cancelled) return;

        setTransactions(localTransactions);
        setCards(localCards);
        setSyncState({
          loading: false,
          pending: false,
          lastSyncedAt: null,
          error: error.message || 'Falha ao carregar a nuvem. Seus dados locais continuam disponíveis.',
        });
      } finally {
        if (!cancelled) {
          setHydrated(true);
          setLoadingData(false);
        }
      }
    };

    hydrateData();

    return () => {
      cancelled = true;
    };
  }, [user, isCloudAccount, onSessionUpdate]);

  useEffect(() => {
    if (!user || !hydrated) return;
    persistLocalBackup(user.id, transactions, cards);
  }, [transactions, cards, user, hydrated]);

  useEffect(() => {
    if (!isCloudAccount || !hydrated || !user) return undefined;

    setSyncState((current) => ({ ...current, pending: true }));

    const timeoutId = window.setTimeout(async () => {
      setSyncState((current) => ({ ...current, loading: true, error: '' }));

      try {
        const activeSession = await refreshUserSession(user);
        onSessionUpdate(activeSession);

        const saved = await saveCloudAccountData({
          user: activeSession,
          token: activeSession.accessToken,
          transactions,
          cards,
        });

        setSyncState({
          loading: false,
          pending: false,
          lastSyncedAt: saved?.updated_at || new Date().toISOString(),
          error: '',
        });
      } catch (error) {
        setSyncState((current) => ({
          ...current,
          loading: false,
          pending: false,
          error: error.message || 'Falha ao sincronizar com a nuvem.',
        }));
      }
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [transactions, cards, user, hydrated, isCloudAccount, onSessionUpdate]);

  const syncNow = async () => {
    if (!isCloudAccount || !user) return;

    setSyncState((current) => ({ ...current, loading: true, error: '' }));

    try {
      const activeSession = await refreshUserSession(user);
      onSessionUpdate(activeSession);

      const saved = await saveCloudAccountData({
        user: activeSession,
        token: activeSession.accessToken,
        transactions,
        cards,
      });

      setSyncState({
        loading: false,
        pending: false,
        lastSyncedAt: saved?.updated_at || new Date().toISOString(),
        error: '',
      });
    } catch (error) {
      setSyncState((current) => ({
        ...current,
        loading: false,
        error: error.message || 'Falha ao sincronizar com a nuvem.',
      }));
    }
  };

  const importLocalData = () => {
    if (!user) return;

    setTransactions(loadLocalTransactions(user.id));
    setCards(loadLocalCards(user.id));
    setSyncState((current) => ({ ...current, pending: true, error: '' }));
  };

  return {
    transactions,
    setTransactions,
    cards,
    setCards,
    hydrated,
    loadingData,
    syncState,
    syncNow,
    importLocalData,
  };
};
