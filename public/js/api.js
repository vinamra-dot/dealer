import { state, clearSession } from './state.js';

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  try {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();

    if (res.status === 401) {
      clearSession();
      window.location.reload();
      throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok || data.success === false) {
      throw new Error(data.error || 'Server error occurred.');
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    alert(err.message || 'Network request failed.');
    throw err;
  }
}

export const api = {
  get: (url) => apiRequest(url, { method: 'GET' }),
  post: (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
  patch: (url, body) => apiRequest(url, { method: 'PATCH', body: JSON.stringify(body) })
};
