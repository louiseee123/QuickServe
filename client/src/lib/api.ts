
import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated. Please log in.");
  }

  const token = await user.getIdToken();

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fullUrl = `${API_URL}${url}`;

  const response = await fetch(fullUrl, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "An error occurred with the API request.");
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true }; 
  }

  return response.json();
}
