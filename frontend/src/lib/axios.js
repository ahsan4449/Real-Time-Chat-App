import axios from "axios";

export const axiosInstance=axios.create({
  baseURL:  "https://real-time-chat-app-2-9o6t.onrender.com/api",
  withCredentials:true,
})