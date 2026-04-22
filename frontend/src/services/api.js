const API = 'http://localhost:8080/api';

export function getAuthToken() {
  return localStorage.getItem('pc_token');
}

export function getUserEmail() {
  return localStorage.getItem('pc_email');
}

export function setAuth(token, email) {
  localStorage.setItem('pc_token', token);
  localStorage.setItem('pc_email', email);
}

export function clearAuth() {
  localStorage.removeItem('pc_token');
  localStorage.removeItem('pc_email');
}

export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API}${endpoint}`, { ...options, headers });

    if (res.status === 401) {
      clearAuth();
      window.dispatchEvent(new Event('auth-expired'));
      return null;
    }

    if (!res.ok) {
      let msg = `Error ${res.status}`;
      try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          msg = data.message || msg;
        } else {
          const text = await res.text();
          console.error('Server error response:', text);
        }
      } catch (_) { }
      throw new Error(msg);
    }

    return await res.json();
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('No se puede conectar al servidor');
    }
    throw err;
  }
}