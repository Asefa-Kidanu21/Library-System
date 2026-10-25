


import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Set Clerk's getToken function from a React component.
let getClerkToken = null;

export function setClerkTokenGetter(getToken) {
  getClerkToken = getToken;
}

// Automatically attach the Clerk session token to requests.
api.interceptors.request.use(async (config) => {
  if (getClerkToken) {
    const token = await getClerkToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
