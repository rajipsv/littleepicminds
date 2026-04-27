import axios from 'axios';

// When deployed to Vercel, the frontend and backend are usually on the same domain if deployed together,
// or the backend has a specific Vercel URL.
// We default to the local dev server port 5000 if no env variable is set.
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
const api = axios.create({
  baseURL: API_URL
});

export default api;
