/**
 * The API normally lives behind the same `/api` path in Replit.
 * Vercel hosts Oliva as a static frontend, so set VITE_API_BASE_URL to the
 * deployed API root, including `/api` (for example, https://api.example.com/api).
 */
const configuredApiBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
const appBase = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

export const API_BASE = configuredApiBase || `${appBase}/api`;