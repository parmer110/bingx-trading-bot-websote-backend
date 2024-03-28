import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export const axiosBase = axios.create({
  baseURL: "https://almastalayi.ir/api",
});

export const axiosAuthorize = axios.create({
  baseURL: "https://almastalayi.ir/api",
});

axiosAuthorize.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosAuthorize.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const { setAppState } = useContext(AppContext);
      setAppState("login");
    }
    return Promise.reject(error);
  },
);
