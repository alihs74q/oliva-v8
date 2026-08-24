// In Replit, the web artifact proxy forwards relative /api requests to the
// local API artifact. On Vercel, set VITE_API_BASE_URL to the public origin of
// the API deployment that owns this project's database.
const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');

export const API_BASE = configuredApiBase || '/api';