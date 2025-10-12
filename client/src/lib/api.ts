
const API_URL = 'https://68eb38f20005d80dc92c.fra.appwrite.run';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  const fullUrl = `${API_URL}${url}`;

  // Include credentials to send cookies with the request
  const fetchOptions = { ...options, headers, credentials: 'include' as const };

  const response = await fetch(fullUrl, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "An error occurred with the API request.");
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true }; 
  }

  return response.json();
}

export async function getRequestById(id: string) {
  return fetchWithAuth(`/api/request/${id}`);
}
