const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

exports.getMine = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const items = await Notification.find({ user_id: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit);
  const unreadCount = await Notification.countDocuments({ user_id: req.user._id, is_read: false });
  res.json({ items, unreadCount });
});

exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    { is_read: true, read_at: new Date() },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json(notification);
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user_id: req.user._id, is_read: false },
    { is_read: true, read_at: new Date() }
  );
  res.json({ ok: true });
});
