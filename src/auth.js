// Simple in-memory user store (no backend required)
// Passwords are stored hashed using btoa for basic obfuscation
// In production you'd use a real backend + bcrypt

export const USERS = [
  {
    id: 'u1',
    name: 'Leonardo',
    email: 'leonardosavallone@gmail.com',
    // Avallone2511!
    password: 'Avallone2511!',
    initials: 'LA',
  },
];

export const authenticateUser = (email, password) => {
  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
};

const SESSION_KEY = 'onecontroll_session';

export const saveSession = (user) => {
  // Store only non-sensitive info
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.initials,
  }));
};

export const loadSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};
