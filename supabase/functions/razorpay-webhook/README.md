# Razorpay Webhook Handler - Supabase Edge Function

Production-ready Supabase Edge Function to handle Razorpay payment webhooks with secure signature verification, database persistence, and transactional email confirmations.

## Features

- ✅ **HMAC SHA-256 Signature Verification** - Secure webhook validation using Razorpay's signature
- ✅ **Payment Event Handling** - Process `payment.captured` events from Razorpay
- ✅ **Database Persistence** - Store transactions in Supabase PostgreSQL with row-level security
- ✅ **Email Confirmations** - Send payment receipts via Resend email service
- ✅ **Test & Live Mode Support** - Easy switching between test and production environments
- ✅ **Error Handling** - Robust error logging and retry mechanisms
- ✅ **Idempotent Operations** - Prevents duplicate payments using `payment_id` uniqueness

## Quick Start

### 1. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 2. Deploy to Supabase

```bash
# Set secrets in Supabase
supabase secrets set --project-ref your-project-ref \
  RAZORPAY_ENV=test \
  RAZORPAY_WEBHOOK_SECRET_TEST=your-test-secret \
  RAZORPAY_WEBHOOK_SECRET_LIVE=your-live-secret \
  RESEND_API_KEY=your-resend-api-key \
  EMAIL_FROM="Payments <payments@yourdomain.com>"

# Deploy function
supabase functions deploy razorpay-webhook --project-ref your-project-ref
```

### 3. Configure Razorpay Webhook

**In Razorpay Dashboard:**

1. Settings → Webhooks → Add Webhook
2. URL: `https://your-project.functions.supabase.co/razorpay-webhook`
3. Secret: (Your `RAZORPAY_WEBHOOK_SECRET_TEST`)
4. Events: Select `payment.captured`
5. Save

## Environment Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `PROJECT_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `SERVICE_ROLE_KEY` | Supabase service role key | `eyJh...` |
| `RAZORPAY_ENV` | Environment: `test` or `live` | `test` |
| `RAZORPAY_WEBHOOK_SECRET_TEST` | Test webhook secret from Razorpay | `webhook_secret_...` |
| `RAZORPAY_WEBHOOK_SECRET_LIVE` | Live webhook secret from Razorpay | `webhook_secret_...` |
| `RESEND_API_KEY` | Resend email service API key | `re_...` |
| `EMAIL_FROM` | Sender email address | `Payments <payments@yourdomain.com>` |

## API Endpoint

```
POST https://your-project.functions.supabase.co/razorpay-webhook
```

**Headers:**
- `x-razorpay-signature`: HMAC-SHA256 signature (provided by Razorpay)
- `Content-Type`: application/json

**Response:**
- `200 OK` - Webhook processed successfully
- `400 Bad Request` - Invalid signature, JSON, or body
- `405 Method Not Allowed` - Only POST requests accepted

## Database Schema

The function inserts into the `payments` table:

```sql
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text UNIQUE NOT NULL,
  order_id text,
  amount bigint NOT NULL,
  currency text DEFAULT 'INR',
  status text NOT NULL,
  email text,
  raw_payload jsonb,
  created_at timestamptz DEFAULT now()
);
```

## Testing

### Local Testing

```bash
# Start Supabase local development
supabase start

# In another terminal, serve the function
supabase functions serve razorpay-webhook --env-file .env.local

# Function available at: http://localhost:54321/functions/v1/razorpay-webhook
```

### Trigger Test Webhook

```bash
curl -X POST http://localhost:54321/functions/v1/razorpay-webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: test-signature" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_123456",
          "order_id": "order_123",
          "amount": 5000,
          "currency": "INR",
          "status": "captured",
          "email": "customer@example.com"
        }
      }
    }
  }'
```

## Production Deployment Checklist

- [ ] Get Razorpay Live API keys
- [ ] Create Live webhook secret in Razorpay
- [ ] Update environment: `RAZORPAY_ENV=live`
- [ ] Set `RAZORPAY_WEBHOOK_SECRET_LIVE` in Supabase
- [ ] Redeploy Edge Function
- [ ] Add Live webhook in Razorpay dashboard
- [ ] Test 1-2 real payments
- [ ] Monitor Supabase Logs for errors
- [ ] Set up email allowlist in Resend (if using free tier)

## Signature Verification

The function verifies webhooks using HMAC-SHA256:

```
Expected Signature = HMAC-SHA256(webhook_body, webhook_secret)
```

This matches the `x-razorpay-signature` header provided by Razorpay.

## Error Handling

- Invalid signatures return `400` (no payment recorded)
- JSON parse errors return `400`
- Non-`payment.captured` events return `200` (ignored gracefully)
- Database errors are logged but return `200` (prevents retry storms)
- Email errors are logged but don't block webhook success

## Email Template

Customers receive a confirmation email with:
- Payment ID
- Order ID
- Amount in INR
- Payment status
- Contact support message

Edit the HTML template in `index.js` to customize.

## Troubleshooting

### "Invalid signature" errors
- Verify `RAZORPAY_WEBHOOK_SECRET_TEST/LIVE` matches Razorpay dashboard
- Ensure `RAZORPAY_ENV` matches the mode (test/live)
- Check that raw body isn't being modified

### "Payment not appearing in database"
- Check RLS policies on `payments` table
- Verify `SERVICE_ROLE_KEY` is correct
- Look at Supabase Logs for SQL errors

### "Emails not sending"
- Verify `RESEND_API_KEY` is correct
- Check that `EMAIL_FROM` domain is verified in Resend
- Review Resend dashboard for failed sends

## Cost Considerations

- **Supabase:** ~$5/month (Pay-as-you-go for Edge Functions)
- **Resend:** Free tier: 100 emails/day; Paid: $20/month
- **Razorpay:** 2% payment processing fees (standard)

## License

MIT

## Support

For issues or questions:
1. Check Supabase Logs: Project → Logs → Edge Functions
2. Review Razorpay webhook delivery status
3. Verify environment variables are set correctly
