import axios from "axios";

// Single axios instance used for all API calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api", // vite proxy forwards this to http://localhost:5000/api
});

// Automatically attach JWT token to every request
// So we don't have to manually add it in every component
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;