import axios from "axios";

export const axiosInstance=axios.create({
  baseURL:  "https://real-time-chat-app-04f9.onrender.com/api",
  withCredentials:true,
})