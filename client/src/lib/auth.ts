/**
 * HAZARDLINK — Auth helpers (client-side token storage)
 */
const TOKEN_KEY = 'hazardlink_token';

export function saveToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function setAuthToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}
