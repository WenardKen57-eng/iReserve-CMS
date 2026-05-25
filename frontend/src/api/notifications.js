import api from "./axios";

export const NotificationAPI = {
  getMine: (params = {}) => api.get("/notifications/me", { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all")
};
