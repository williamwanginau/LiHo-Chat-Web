import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Where we keep the access token by default (client-only)
const TOKEN_KEY = 'liho.accessToken';

// Pluggable token provider so AuthProvider can override later
type TokenProvider = () => string | null | Promise<string | null>;
let tokenProvider: TokenProvider = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export function setAuthTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

export function setAccessToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // no-op
  }
}

export type ApiError = {
  status: number | null;
  message: string;
  code?: string;
  data?: unknown;
  isNetworkError?: boolean;
  isTimeout?: boolean;
};

function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<unknown>;
    const status = e.response?.status ?? null;
    const data = e.response?.data as unknown;
    let message = e.message || 'Request error';
    let code: string | undefined = undefined;
    if (data && typeof data === 'object') {
      const maybeMsg = (data as { message?: unknown }).message;
      if (typeof maybeMsg === 'string') message = maybeMsg;
      const maybeCode = (data as { code?: unknown }).code;
      if (typeof maybeCode === 'string') code = maybeCode;
    }
    return {
      status,
      message: String(message),
      code,
      data,
      isNetworkError: !!e.isAxiosError && !e.response,
      isTimeout: e.code === 'ECONNABORTED',
    };
  }
  return { status: null, message: String(err) };
}

// Single axios instance routed through Next rewrites (/api -> NEXT_PUBLIC_API_URL)
export const api: AxiosInstance = axios.create({
  baseURL: '/api',
  // Free-tier backends (e.g., Render) may cold start; allow up to 30s
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Authorization if token available
api.interceptors.request.use(async (config) => {
  try {
    const token = await tokenProvider();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // ignore token provider errors
  }
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(toApiError(err)),
);

// Typed helpers
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}

export async function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.post<T>(url, body, config);
  return res.data;
}

export async function put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.put<T>(url, body, config);
  return res.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.delete<T>(url, config);
  return res.data;
}

// Auth-specific minimal types for upcoming steps
export type LoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

// Rooms + Messages API types
export type RoomLastMessage = {
  content: string;
  createdAt: string;
};

export type RoomItem = {
  id: string;
  name: string;
  isPrivate: boolean;
  updatedAt: string;
  lastMessage?: RoomLastMessage;
};

export type RoomsListResponse = {
  items: RoomItem[];
  nextCursor?: string;
  hasMore?: boolean;
  serverTime: string;
};

export type MessageAuthor = { id: string; name: string };
export type MessageItem = {
  id: string;
  messageId?: string;
  roomId: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  author: MessageAuthor;
};

export type MessagesPage = {
  items: MessageItem[];
  nextCursor?: string;
  hasMore: boolean;
  serverTime: string;
};
