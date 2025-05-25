import axios from "axios";

const API_BASE_URL = "https://bechatcnm-production.up.railway.app"; // thay bằng địa chỉ server

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
