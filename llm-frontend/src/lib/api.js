// Vite exposes environment variables through `import.meta.env`, but ONLY
// ones prefixed with VITE_ (this is a deliberate security measure - it
// stops you from accidentally shipping a secret server-side env var to
// the browser). Since this value isn't secret (it's just a URL), that's
// fine here.
//
// The fallback after `||` means: if you never set up a .env file, it
// just defaults to your local FastAPI server.
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
