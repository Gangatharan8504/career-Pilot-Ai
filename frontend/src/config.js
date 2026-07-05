let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Strip trailing slash if present to prevent double-slash gateway errors (e.g. '//login')
if (rawUrl.endsWith('/')) {
  rawUrl = rawUrl.slice(0, -1);
}

export const API_BASE_URL = rawUrl;
