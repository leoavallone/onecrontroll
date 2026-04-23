const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const STORAGE_TABLE = 'account_data';

const buildUrl = (path) => `${SUPABASE_URL}${path}`;

const parseResponse = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

const baseHeaders = (token) => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const isCloudEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const getCloudConfigStatus = () => {
  if (isCloudEnabled) {
    return {
      enabled: true,
      message: 'Sincronização em nuvem ativa via Supabase.',
    };
  }

  return {
    enabled: false,
    message: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para sincronizar entre dispositivos.',
  };
};

export const cloudSignIn = async (email, password) => {
  const response = await fetch(buildUrl('/auth/v1/token?grant_type=password'), {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new Error(payload?.msg || payload?.error_description || 'Falha ao entrar na conta.');
  }

  return payload;
};

export const cloudSignUp = async ({ name, email, password }) => {
  const response = await fetch(buildUrl('/auth/v1/signup'), {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: {
        name,
        initials: getInitials(name),
      },
    }),
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new Error(payload?.msg || payload?.error_description || 'Não foi possível criar a conta.');
  }

  return payload;
};

export const cloudRefreshSession = async (refreshToken) => {
  const response = await fetch(buildUrl('/auth/v1/token?grant_type=refresh_token'), {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new Error(payload?.msg || payload?.error_description || 'Sua sessão expirou. Faça login novamente.');
  }

  return payload;
};

export const loadCloudAccountData = async ({ userId, token }) => {
  const response = await fetch(
    buildUrl(`/rest/v1/${STORAGE_TABLE}?user_id=eq.${encodeURIComponent(userId)}&select=transactions,cards,updated_at`),
    {
      headers: baseHeaders(token),
    }
  );

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Não foi possível carregar os dados da nuvem.');
  }

  return payload[0] || null;
};

export const saveCloudAccountData = async ({ user, token, transactions, cards }) => {
  const response = await fetch(buildUrl(`/rest/v1/${STORAGE_TABLE}`), {
    method: 'POST',
    headers: {
      ...baseHeaders(token),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      user_id: user.id,
      email: user.email,
      name: user.name,
      initials: user.initials,
      transactions,
      cards,
      updated_at: new Date().toISOString(),
    }),
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Não foi possível salvar os dados na nuvem.');
  }

  return payload[0] || null;
};

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'OC';

export const mapCloudUser = (cloudUser, session) => ({
  id: cloudUser.id,
  name: cloudUser.user_metadata?.name || cloudUser.email?.split('@')[0] || 'Usuário',
  email: cloudUser.email,
  initials: cloudUser.user_metadata?.initials || getInitials(cloudUser.user_metadata?.name || cloudUser.email),
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
  storageMode: 'cloud',
});
