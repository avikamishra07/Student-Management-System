import Constants from 'expo-constants';

const BACKEND_PORT = 8080;

/**
 * Where the Spring Boot backend is.
 *
 * 1. If EXPO_PUBLIC_API_URL is set (e.g. in a .env file), that is used.
 * 2. Otherwise we reuse the laptop IP that Expo is already serving from
 *    (the phone can reach it, so it can reach the backend on port 8080 too).
 * 3. Fallback: localhost (works for the iOS simulator / web).
 */
function resolveApiUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.5:8081"
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${BACKEND_PORT}/api/v1`;
  }
  return `http://localhost:${BACKEND_PORT}/api/v1`;
}

export const API_URL = resolveApiUrl();
export const PAGE_SIZE = 10;
