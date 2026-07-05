// Backend origin. Locally the default works out of the box; in production
// Vercel sets NEXT_PUBLIC_API_BASE_URL to the Railway URL at build time.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
