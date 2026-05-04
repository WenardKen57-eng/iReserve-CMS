const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const {
	createCheckoutSession,
	verifyWebhookSignature,
	extractWebhookData,
	isPaidEvent,
	isFailedEvent
} = require("../services/payment.service");

exports.create = asyncHandler(async (req, res) => res.status(201).json(await Payment.create(req.body)));
exports.getAll = asyncHandler(async (req, res) => res.json(await Payment.find().populate("booking_id customer_id")));
exports.getMine = asyncHandler(async (req, res) => res.json(await Payment.find({ customer_id: req.user._id }).populate("booking_id customer_id")));
exports.getById = asyncHandler(async (req, res) => res.json(await Payment.findById(req.params.id).populate("booking_id customer_id")));
exports.update = asyncHandler(async (req, res) => res.json(await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true })));
exports.remove = asyncHandler(async (req, res) => { await Payment.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); });

exports.createCheckout = asyncHandler(async (req, res) => {
	const {
		booking_id,
		amount,
		payment_type = "deposit",
		payment_method_types = ["gcash", "paymaya", "card"],
		success_url,
		cancel_url
	} = req.body;

	if (!booking_id) {
		return res.status(400).json({ message: "booking_id is required" });
	}

	const booking = await Booking.findById(booking_id).populate("customer_id");
	if (!booking) {
		return res.status(404).json({ message: "Booking not found" });
	}

	const isOwner = String(booking.customer_id?._id) === String(req.user._id);
	const isPrivileged = ["admin", "manager"].includes(req.user.role);
	if (!isOwner && !isPrivileged) {
		return res.status(403).json({ message: "Not allowed to pay for this booking" });
	}

	const fallbackAmount = Number(booking.total_price || 0);
	const payableAmount = Number(amount || fallbackAmount);
	if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
		return res.status(400).json({ message: "Invalid amount" });
	}

	const appBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
	const successUrl = success_url || `${appBaseUrl}/customer/payments?status=success`;
	const cancelUrl = cancel_url || `${appBaseUrl}/customer/payments?status=cancelled`;

	const payment = await Payment.create({
		booking_id: booking._id,
		customer_id: booking.customer_id?._id || req.user._id,
		amount: payableAmount,
		currency: "PHP",
		payment_type,
		method: "paymongo",
		status: "pending",
		gateway: "paymongo"
	});

	const checkout = await createCheckoutSession({
		amount: payableAmount,
		currency: "PHP",
		paymentMethodTypes: payment_method_types,
		description: `Booking ${booking._id} (${payment_type})`,
		successUrl,
		cancelUrl,
		metadata: {
			local_payment_id: String(payment._id),
			booking_id: String(booking._id),
			customer_id: String(booking.customer_id?._id || req.user._id),
			payment_type
		}
	});

	const checkoutData = checkout?.data || {};
	const checkoutAttributes = checkoutData.attributes || {};

	payment.gateway_checkout_id = checkoutData.id;
	payment.checkout_url = checkoutAttributes.checkout_url;
	payment.metadata = checkoutAttributes.metadata || payment.metadata;
	await payment.save();

	res.status(201).json({
		payment,
		checkout_url: checkoutAttributes.checkout_url,
		checkout_id: checkoutData.id
	});
});

exports.handleWebhook = asyncHandler(async (req, res) => {
	const signatureHeader = req.headers["paymongo-signature"] || "";
	const rawBody = req.rawBody || JSON.stringify(req.body || {});

	const isValidSignature = verifyWebhookSignature({ rawBody, signatureHeader });
	if (!isValidSignature) {
		return res.status(401).json({ message: "Invalid webhook signature" });
	}

	const payload = req.body || {};
	const event = extractWebhookData(payload);

	let payment = null;
	if (event.metadata?.local_payment_id) {
		payment = await Payment.findById(event.metadata.local_payment_id);
	}
	if (!payment && event.checkoutSessionId) {
		payment = await Payment.findOne({ gateway_checkout_id: event.checkoutSessionId });
	}

	if (!payment) {
		return res.status(200).json({ ok: true, message: "No matching local payment" });
	}

	payment.gateway_reference = event.referenceNumber || payment.gateway_reference;
	payment.gateway_payment_intent_id = event.paymentIntentId || payment.gateway_payment_intent_id;
	payment.metadata = {
		...(payment.metadata || {}),
		...(event.metadata || {})
	};

	if (isPaidEvent(event.eventType)) {
		payment.status = "approved";
		payment.paid_at = new Date();
	} else if (isFailedEvent(event.eventType)) {
		payment.status = "rejected";
	}
	if (event.amount > 0) payment.amount = event.amount;

	await payment.save();

	if (payment.booking_id) {
		await Booking.findByIdAndUpdate(payment.booking_id, {
			payment_status: payment.status,
			payment_method: payment.method
		});
	}

	res.status(200).json({ ok: true });
});