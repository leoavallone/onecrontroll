import { cloudRefreshSession, cloudSignIn, cloudSignUp, getInitials, isCloudEnabled, mapCloudUser } from './cloud';

export const USERS = [
  {
    id: 'u1',
    name: 'Leonardo',
    email: 'leonardosavallone@gmail.com',
    // Avallone2511!
    password: 'Avallone2511!',
    initials: 'LA',
  },
  {
    id: 'u2',
    name: 'Dani',
    email: 'daniiroque13@gmail.com',
    password: '39840918Dani*',
    initials: 'DR',
  },
];

const authenticateLocalUser = (email, password) => {
  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
};

export const authenticateUser = async (email, password) => {
  if (isCloudEnabled) {
    const payload = await cloudSignIn(email, password);
    return mapCloudUser(payload.user, payload);
  }

  const user = authenticateLocalUser(email, password);
  return user ? { ...user, storageMode: 'local' } : null;
};

export const registerUser = async ({ name, email, password }) => {
  if (!isCloudEnabled) {
    throw new Error('O cadastro em nuvem depende da configuração do Supabase.');
  }

  const payload = await cloudSignUp({ name, email, password });
  return {
    ...mapCloudUser(payload.user, payload),
    name,
    initials: payload.user?.user_metadata?.initials || getInitials(name),
  };
};

const SESSION_KEY = 'onecontroll_session';

export const saveSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.initials,
    accessToken: user.accessToken || null,
    refreshToken: user.refreshToken || null,
    storageMode: user.storageMode || 'local',
  }));
};

export const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const refreshUserSession = async (session) => {
  if (!session?.refreshToken || session.storageMode !== 'cloud' || !isCloudEnabled) {
    return session;
  }

  const payload = await cloudRefreshSession(session.refreshToken);
  const refreshedUser = mapCloudUser(payload.user, payload);
  saveSession(refreshedUser);
  return refreshedUser;
};
