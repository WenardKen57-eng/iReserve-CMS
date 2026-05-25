const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, default: "info" },
  link: { type: String },
  meta: mongoose.Schema.Types.Mixed,
  is_read: { type: Boolean, default: false },
  read_at: Date
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
