export const DEFAULT_PREFERENCES = {
  theme: 'midnight',
  startPage: 'dashboard',
  compactMode: false,
  showBalanceWidget: true,
};

const getPreferencesStorageKey = (userId) => `onecontroll_preferences_${userId}`;

export const loadUserPreferences = (userId) => {
  if (!userId) return DEFAULT_PREFERENCES;

  try {
    const stored = localStorage.getItem(getPreferencesStorageKey(userId));
    if (!stored) return DEFAULT_PREFERENCES;

    return {
      ...DEFAULT_PREFERENCES,
      ...JSON.parse(stored),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const saveUserPreferences = (userId, preferences) => {
  if (!userId) return;

  localStorage.setItem(
    getPreferencesStorageKey(userId),
    JSON.stringify({
      ...DEFAULT_PREFERENCES,
      ...preferences,
    })
  );
};
