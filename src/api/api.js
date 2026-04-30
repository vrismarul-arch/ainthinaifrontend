import axios from "axios";

const API = axios.create({

  //  baseURL: "https://ainthinaibackend.onrender.com",
   baseURL: "https://skyblue-bat-274458.hostingersite.com",
  //  baseURL: "http://localhost:5000"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
