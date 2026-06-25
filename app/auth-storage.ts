export type MocoUser = {
  email: string;
  name: string;
  password?: string;
  phone?: string;
  city?: string;
  address?: string;
};

const USERS_KEY = "moco-users";
const CURRENT_USER_KEY = "moco-user";
const AUTH_KEY = "moco-auth";
const RESET_KEY = "moco-password-resets";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function readUsers() {
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) || "{}") as Record<string, MocoUser>;
  } catch {
    return {};
  }
}

export function readCurrentUser() {
  try {
    return JSON.parse(window.localStorage.getItem(CURRENT_USER_KEY) || "null") as MocoUser | null;
  } catch {
    return null;
  }
}

export function saveUser(user: MocoUser) {
  const email = normalizeEmail(user.email);
  const users = readUsers();
  const previous = users[email] || {};
  const nextUser = { ...previous, ...user, email };

  users[email] = nextUser;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(nextUser));
  window.localStorage.setItem(AUTH_KEY, "true");
  window.dispatchEvent(new Event("moco-auth-updated"));

  return nextUser;
}

export function findUser(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return readUsers()[normalizedEmail] || null;
}

export function signOutUser() {
  window.localStorage.removeItem(AUTH_KEY);
  window.localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new Event("moco-auth-updated"));
}

export function createPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const resets = readPasswordResets();

  resets[normalizedEmail] = {
    token,
    expiresAt: Date.now() + 30 * 60 * 1000,
  };
  window.localStorage.setItem(RESET_KEY, JSON.stringify(resets));

  return { email: normalizedEmail, token };
}

export function validatePasswordReset(email: string, token: string) {
  const normalizedEmail = normalizeEmail(email);
  const reset = readPasswordResets()[normalizedEmail];

  return Boolean(reset && reset.token === token && reset.expiresAt > Date.now());
}

export function clearPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const resets = readPasswordResets();

  delete resets[normalizedEmail];
  window.localStorage.setItem(RESET_KEY, JSON.stringify(resets));
}

function readPasswordResets() {
  try {
    return JSON.parse(window.localStorage.getItem(RESET_KEY) || "{}") as Record<
      string,
      { token: string; expiresAt: number }
    >;
  } catch {
    return {};
  }
}
