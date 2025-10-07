
import { auth } from "./firebase";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) {
    // If the user is not authenticated, you might want to redirect to login
    // or handle it in a way that makes sense for your application.
    throw new Error("User not authenticated. Please log in.");
  }

  const token = await user.getIdToken();

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "An error occurred with the API request.");
  }

  // If the response has no content, we can return a success indicator
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true }; 
  }

  return response.json();
}
