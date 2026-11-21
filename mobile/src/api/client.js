import { API_URL } from '../config';

const TIMEOUT_MS = 15000;

/** Error thrown for any failed request. `status` is the HTTP status (0 = network problem). */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Small wrapper around fetch.
 * - adds JSON headers and the "Authorization: Bearer <token>" header
 * - turns the backend's JSON error body into a readable message
 */
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(`Cannot reach the server at ${API_URL}. Is the backend running?`, 0);
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let message = data?.message || `Request failed (${response.status})`;
    if (data?.fieldErrors) {
      message = Object.values(data.fieldErrors).join('\n');
    }
    throw new ApiError(message, response.status);
  }
  return data;
}
