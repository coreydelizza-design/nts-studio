/**
 * API Client — centralized HTTP layer for all backend calls.
 *
 * Usage:
 *   import { api } from '../services/api';
 *   const result = await api.post('/analyze-estate', { prompt });
 *
 * Environment:
 *   VITE_GEMINI_API_URL — base URL for API gateway
 *   VITE_GEMINI_API_KEY — API key (optional, depends on backend auth)
 */

const BASE_URL = import.meta.env.VITE_GEMINI_API_URL || '/api';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface ApiOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
    };
  }

  async post<T = unknown>(path: string, body: unknown, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { ...this.defaultHeaders, ...options?.headers },
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new ApiError(response.status, errorText);
    }

    return response.json();
  }

  async get<T = unknown>(path: string, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...options?.headers },
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new ApiError(response.status, errorText);
    }

    return response.json();
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const api = new ApiClient(BASE_URL);
