import { shouldUseApiBackend, appConfig } from './config';
import { AuthSession, AuthUser, LoginCredentials } from '../types/auth';

const SESSION_STORAGE_KEY = 'smart-it-auth-session';
const AUTH_DELAY_MS = 500;

const mockUsers: Array<AuthUser & { password: string }> = [
  {
    id: 'admin-1',
    name: 'Alicia Admin',
    email: 'admin@smartit.local',
    password: 'admin123',
    role: 'ADMIN',
    avatar: 'AA',
  },
  {
    id: 'agent-1',
    name: 'Marco Agent',
    email: 'agent@smartit.local',
    password: 'agent123',
    role: 'AGENT',
    avatar: 'MA',
  },
  {
    id: 'viewer-1',
    name: 'Vera Viewer',
    email: 'viewer@smartit.local',
    password: 'viewer123',
    role: 'VIEWER',
    avatar: 'VV',
  },
];

function delay<T>(value: T, ms = AUTH_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function sanitizeUser(user: AuthUser & { password?: string }): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
}

function persistSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

async function requestAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Use the fallback message when the body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const authService = {
  getStoredSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  },

  getAuthToken() {
    return this.getStoredSession()?.token ?? null;
  },

  async restoreSession(): Promise<AuthSession | null> {
    const storedSession = this.getStoredSession();
    if (!storedSession) {
      return null;
    }

    if (!shouldUseApiBackend()) {
      return storedSession;
    }

    try {
      const response = await requestAuth<{ data: AuthUser }>('/auth/me', {
        headers: {
          Authorization: `Bearer ${storedSession.token}`,
        },
      });

      const session = {
        user: response.data,
        token: storedSession.token,
      } satisfies AuthSession;

      persistSession(session);
      return session;
    } catch {
      persistSession(null);
      return null;
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (shouldUseApiBackend()) {
      const response = await requestAuth<{ data: AuthSession }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      persistSession(response.data);
      return response.data;
    }

    const matchedUser = mockUsers.find(
      (user) => user.email.toLowerCase() === credentials.email.trim().toLowerCase() && user.password === credentials.password,
    );

    if (!matchedUser) {
      throw new Error('Invalid email or password');
    }

    const session: AuthSession = {
      user: sanitizeUser(matchedUser),
      token: `mock-token-${matchedUser.role.toLowerCase()}`,
    };

    persistSession(session);
    return delay(session);
  },

  async logout() {
    persistSession(null);
    return delay({ success: true }, 150);
  },

  getDemoUsers() {
    return mockUsers.map(sanitizeUser);
  },
};