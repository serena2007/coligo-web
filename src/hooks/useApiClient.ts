// src/hooks/useApiClient.ts

export function getToken(): string | null {
  return localStorage.getItem('coligo_token');
}

export function saveToken(token: string): void {
  localStorage.setItem('coligo_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('coligo_token');
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function apiCall<T>(url: string, method = 'GET', body?: any, isFormData = false): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Ne pas setter Content-Type pour FormData — le browser le fait automatiquement avec le boundary
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const error: any = new Error(errData.error || errData.detail || `Erreur ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  const text = await response.text();
  if (!text) return null as T;

  return JSON.parse(text);
}