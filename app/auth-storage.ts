export type UserRole = "admin" | "customer";

export type MocoUser = {
  email: string;
  name: string;
  password?: string;
  phone?: string;
  city?: string;
  address?: string;
  role?: UserRole;
};

const CURRENT_USER_KEY = "moco-user";
const AUTH_KEY = "moco-auth";

/* ─── Local session helpers (still use localStorage for client session) ─── */

export function readCurrentUser(): MocoUser | null {
  try {
    return JSON.parse(window.localStorage.getItem(CURRENT_USER_KEY) || "null") as MocoUser | null;
  } catch {
    return null;
  }
}

function setSession(user: MocoUser) {
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(AUTH_KEY, "true");
  window.dispatchEvent(new Event("moco-auth-updated"));
}

export function signOutUser() {
  window.localStorage.removeItem(AUTH_KEY);
  window.localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new Event("moco-auth-updated"));
}

/* ─── API-backed auth functions ─── */

/** Sign up a new user via MongoDB */
export async function signUpUser(user: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<{ success: boolean; user?: MocoUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const data = await res.json();

    if (data.success && data.user) {
      setSession(data.user);
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || "Signup failed." };
  } catch {
    return { success: false, error: "Network error." };
  }
}

/** Log in an existing user via MongoDB */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: MocoUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success && data.user) {
      setSession(data.user);
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || "Login failed." };
  } catch {
    return { success: false, error: "Network error." };
  }
}

/** Update profile fields in MongoDB */
export async function updateProfile(
  fields: Partial<MocoUser> & { email: string },
): Promise<{ success: boolean; user?: MocoUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await res.json();

    if (data.success && data.user) {
      setSession(data.user);
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || "Update failed." };
  } catch {
    return { success: false, error: "Network error." };
  }
}

/** Fetch user profile from MongoDB */
export async function fetchProfile(
  email: string,
): Promise<{ success: boolean; user?: MocoUser; error?: string }> {
  try {
    const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (data.success && data.user) {
      setSession(data.user);
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || "Fetch failed." };
  } catch {
    return { success: false, error: "Network error." };
  }
}

/** Create a password-reset token via MongoDB */
export async function createPasswordReset(
  email: string,
): Promise<{ success: boolean; email?: string; token?: string; error?: string }> {
  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (data.success) {
      return { success: true, email: data.email, token: data.token };
    }

    return { success: false, error: data.error || "Reset request failed." };
  } catch {
    return { success: false, error: "Network error." };
  }
}

/** Validate reset token & set new password via MongoDB */
export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
): Promise<{ success: boolean; user?: MocoUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, newPassword }),
    });
    const data = await res.json();

    if (data.success && data.user) {
      setSession(data.user);
      return { success: true, user: data.user };
    }

    if (data.success) {
      return { success: true };
    }

    return { success: false, error: data.error || "Password reset failed." };
  } catch {
    return { success: false, error: "Network error." };
  }
}
