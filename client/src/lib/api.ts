import axios, { AxiosInstance } from 'axios';

const baseURL =
  (import.meta.env.VITE_API_URL && import.meta.env.DEV === false)
    ? import.meta.env.VITE_API_URL
    : '/api';

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
