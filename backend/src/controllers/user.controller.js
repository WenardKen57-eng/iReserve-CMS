const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

exports.getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

exports.updateMe = asyncHandler(async (req, res) => {
  if (req.body.email) {
    const existing = await User.findOne({ email: req.body.email, _id: { $ne: req.user._id } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }
  }

  const updates = {
    full_name: req.body.full_name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  };
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json(user);
});

exports.getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: "customer" })
    .select("full_name email phone is_active createdAt");
  res.json(customers);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { is_active: Boolean(req.body.is_active) },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});