import axios from "axios";

export const axiosInstance=axios.create({
  baseURL: import.meta.env.MODE ="development"? "https://real-time-chat-app-2-9o6t.onrender.com/api":"/api",
  withCredentials:true,
})