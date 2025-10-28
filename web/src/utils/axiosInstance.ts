import axios from "axios";
import { toast } from "~/utils/toast";
import { env } from "~/config/env";

export const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "An error occurred";
    const statusCode = error.response?.status;

    if (statusCode === 429) {
      toast.error("Too many requests. Please try again later.");
    } else if (statusCode >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (statusCode === 404) {
      toast.error("Resource not found.");
    } else if (message) {
      toast.error(message);
    } else {
      toast.error("An unexpected error occurred.");
    }

    console.error("API Error:", message);
    return Promise.reject(error);
  }
);
