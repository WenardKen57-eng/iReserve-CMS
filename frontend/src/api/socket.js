import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (socket) return socket;
  const rawUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const baseUrl = rawUrl.replace(/\/api\/?$/, "");
  const token = localStorage.getItem("token");
  socket = io(baseUrl, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { token }
  });
  return socket;
};

export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
