
const BASE = (
  import.meta.env.VITE_API_URL ||
  'https://ai-software-company-seven.vercel.app/api'
).replace(/\/+$/, '');

export const token = () => localStorage.getItem('asc_token');

export const saveToken = (value) => {
  if (value) {
    localStorage.setItem('asc_token', value);
  } else {
    localStorage.removeItem('asc_token');
  }
};

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const currentToken = token();

  if (currentToken) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed (${response.status})`
    );
  }

  return data;
}
