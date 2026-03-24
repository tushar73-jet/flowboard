import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
});

// Mocking the user for now
api.interceptors.request.use((config) => {
  config.headers["x-user-id"] = "dev-user-id";
  return config;
});

export default api;
