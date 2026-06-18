export const BACKEND_URL = "http://127.0.0.1:8000";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  // Only set Content-Type: application/json when there's a request body
  const hasBody = options.body !== undefined && options.body !== null;
  const headers: Record<string, string> = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const url = endpoint.startsWith("http") ? endpoint : `${BACKEND_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  return response;
}
