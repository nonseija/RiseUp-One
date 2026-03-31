const TOKEN_KEY = 'riseup_access_token'
const COOKIE_NAME = 'riseup_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  // Accessible cookie for Next.js middleware (15 min)
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${15 * 60}; SameSite=Lax`
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
