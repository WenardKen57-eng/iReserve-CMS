const Notification = require("../models/Notification");

const createNotification = async ({ userId, title, body, type = "info", link, meta }, io) => {
  if (!userId) return null;
  const notification = await Notification.create({
    user_id: userId,
    title,
    body,
    type,
    link,
    meta
  });

  if (io) {
    io.to(`user:${userId}`).emit("notification:new", notification);
  }

  return notification;
};

module.exports = { createNotification };
