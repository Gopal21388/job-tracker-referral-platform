import axios from "axios";
import { clearCredentials, setCredentials } from "../redux/features/authSlice.js";
import { store } from "../redux/store.js";
console.log(import.meta.VITE_API_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});
console.log("Base URL used:", api.defaults.baseURL);


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message || "";
    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      (message.toLowerCase().includes("jwt expired") ||
        message.toLowerCase().includes("not authorized"));

    if (shouldRefresh) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const accessToken = data.data.accessToken;
        const currentUser = store.getState().auth.user;

        store.dispatch(
          setCredentials({
            user: currentUser,
            accessToken,
          })
        );

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(clearCredentials());
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
