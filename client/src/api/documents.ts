
import { fetchWithAuth } from '../lib/api';

export async function getDocuments() {
  return fetchWithAuth('/api/documents');
}
