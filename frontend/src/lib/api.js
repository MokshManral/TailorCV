// Base URL of the FastAPI backend.
// Uses VITE_API_URL when set; otherwise localhost:8000 in development and the
// page's own origin in production.
function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;

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
