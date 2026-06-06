import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "/api"
    : import.meta.env.VITE_API_URL,  // ← reads the actual env variable
  withCredentials: true,
});