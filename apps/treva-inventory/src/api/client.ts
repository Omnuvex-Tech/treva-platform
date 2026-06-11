import axios from "axios";

const apiBasePath = import.meta.env.VITE_API_BASE_PATH;

if (!apiBasePath) {
  throw new Error("VITE_API_BASE_PATH is not configured");
}

const apiClient = axios.create({
  baseURL: apiBasePath,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl =
      typeof error.config?.url === "string" ? error.config.url : "";
    const isLoginRequest = requestUrl.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("treva-inventory:unauthorized"));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
