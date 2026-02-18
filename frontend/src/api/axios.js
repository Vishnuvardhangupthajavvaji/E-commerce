import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!localStorage.getItem("refresh")) return Promise.reject(error);
      const refresh = localStorage.getItem("refresh");


      const res = await axios.post(
        "http://127.0.0.1:8000/api/token/refresh/",
        { refresh }
      );

      localStorage.setItem("access", res.data.access);

      originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

      return API(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default API;
