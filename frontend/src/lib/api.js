// Base URL of the FastAPI backend.
// Uses VITE_API_URL or API_URL when set (vite.config.js exposes both via
// envPrefix); otherwise localhost:8000 in development and the page's own
// origin as a last resort.
function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL || import.meta.env.API_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:8000";
  }

  return window.location.origin;
}

export const API_BASE_URL = getApiBaseUrl();
