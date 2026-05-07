/* ============================================================
   api.js — Centralized API Client with JWT injection
   ============================================================ */

const API_BASE = 'http:///api';

/**
 * Get stored auth token from localStorage
 */
const getToken = () => localStorage.getItem('cloudToken');

/**
 * Core fetch wrapper — attaches Authorization header automatically
 * @param {string} endpoint - API path (e.g. '/auth/login')
 * @param {object} options  - fetch options
 */
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      // Token expired — clear storage and redirect to login
      if (res.status === 401) {
        localStorage.removeItem('cloudToken');
        localStorage.removeItem('cloudUser');
        if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register') && !window.location.pathname.includes('index')) {
          window.location.href = 'login.html';
        }
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    throw err;
  }
};

/* ── Auth API ─────────────────────────────────────────────────── */
const authAPI = {
  register: (data) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request('/auth/me'),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

/* ── Files API ────────────────────────────────────────────────── */
const filesAPI = {
  /**
   * Upload files with progress tracking
   * @param {FileList|File[]} files
   * @param {function} onProgress - callback(percent)
   */
  upload: (files, onProgress) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));

      const xhr = new XMLHttpRequest();
      const token = getToken();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.message || 'Upload failed'));
          }
        } catch {
          reject(new Error('Invalid server response'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed. Network error.')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled.')));

      xhr.open('POST', `${API_BASE}/files/upload`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  getFiles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/files${qs ? '?' + qs : ''}`);
  },

  getStats: () => request('/files/stats'),

  download: (fileId) => request(`/files/${fileId}/download`),

  delete: (fileId) =>
    request(`/files/${fileId}`, { method: 'DELETE' }),

  rename: (fileId, name) =>
    request(`/files/${fileId}/rename`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  toggleStar: (fileId) =>
    request(`/files/${fileId}/star`, { method: 'PATCH' }),
};

/* ── Auth Helpers ─────────────────────────────────────────────── */
const Auth = {
  /** Store token and user data after login/register */
  setSession: (token, user) => {
    localStorage.setItem('cloudToken', token);
    localStorage.setItem('cloudUser', JSON.stringify(user));
  },

  /** Clear session data */
  clearSession: () => {
    localStorage.removeItem('cloudToken');
    localStorage.removeItem('cloudUser');
  },

  /** Get current user object */
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('cloudUser'));
    } catch {
      return null;
    }
  },

  /** Check if user is authenticated */
  isAuthenticated: () => !!localStorage.getItem('cloudToken'),

  /** Redirect to login if not authenticated */
  requireAuth: () => {
    if (!Auth.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  /** Redirect to dashboard if already authenticated */
  redirectIfAuthenticated: () => {
    if (Auth.isAuthenticated()) {
      window.location.href = 'dashboard.html';
    }
  },
};
