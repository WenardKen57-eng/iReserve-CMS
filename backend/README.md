# iReserve CMS Deployment Notes

## Render Deployment Checklist

### Backend
- Set up a new Web Service on Render, connect to your GitHub repo.
- Use the following environment variables (see .env.example):
  - MONGO_URI (from MongoDB Atlas)
  - JWT_SECRET
  - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  - FRONTEND_URL (your deployed frontend URL)
  - BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_PASS
  - MAIL_FROM, MAIL_PROVIDER, BOOKING_BUFFER_MINUTES, PORT
- Start command: `npm start`

### Frontend
- Set up a new Static Site on Render, connect to your GitHub repo.
- Set environment variable VITE_API_BASE_URL to your backend Render URL + `/api`
- Build command: `npm run build`
- Publish directory: `dist`

### MongoDB Atlas
- Create a cluster and get your connection string for MONGO_URI.

---

## Local Development
- Copy `.env.example` to `.env` in both backend and frontend, fill in values.
- Start backend: `npm run dev`
- Start frontend: `npm run dev`

---

## Notes
- CORS is configured to allow only the frontend URL in production.
- API URLs are set via environment variables for flexibility.

---

## PayMongo Integration

### Required Backend Environment Variables
- `PAYMONGO_SECRET_KEY`: Your PayMongo secret key (`sk_test_...` or `sk_live_...`).
- `PAYMONGO_WEBHOOK_SECRET`: Webhook signing secret from the PayMongo webhook endpoint.
- `FRONTEND_URL`: Already used for checkout success/cancel redirects.

### Backend Endpoints Added
- `POST /api/payments/checkout` (auth required): creates a PayMongo Checkout Session.
- `POST /api/payments/webhook` (public): receives PayMongo webhook events.

### Example Request for Checkout
`POST /api/payments/checkout`

```json
{
  "booking_id": "BOOKING_OBJECT_ID",
  "amount": 5000,
  "payment_type": "deposit",
  "payment_method_types": ["gcash", "paymaya", "card"],
  "success_url": "http://localhost:5173/customer/payments?status=success",
  "cancel_url": "http://localhost:5173/customer/payments?status=cancelled"
}
```

### Frontend Usage
- Call `CustomerAPI.createPaymentCheckout(payload)`.
- Redirect the browser to `response.data.checkout_url`.

### Webhook Setup in PayMongo
1. Create a webhook endpoint in PayMongo dashboard: `https://YOUR_BACKEND_DOMAIN/api/payments/webhook`.
2. Subscribe to at least:
   - `checkout_session.payment.paid`
   - `checkout_session.payment.failed`
3. Save the webhook secret to `PAYMONGO_WEBHOOK_SECRET`.

### What Happens on Paid Webhook
- Local payment status is updated to `approved`.
- Booking `payment_status` is synced to `approved`.
