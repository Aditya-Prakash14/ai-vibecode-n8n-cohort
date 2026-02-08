# Razorpay Webhook - Deployment Guide

## Prerequisites

1. **Supabase Project**: ai-cohort project (huknwlunnneuigofixcz) ✅
2. **Supabase CLI**: `npm install -g supabase`
3. **Git & GitHub**: Repository access
4. **Razorpay Account**: [dashboard.razorpay.com](https://dashboard.razorpay.com)
5. **Resend Account**: [resend.com](https://resend.com)

## Step 1: Get Your Credentials

### Supabase Credentials

```bash
# Go to Supabase Dashboard > Project Settings > API
# Copy these:
PROJECT_URL=https://huknwlunnneuigofixcz.supabase.co
SERVICE_ROLE_KEY=eyJh... (your service role key)
```

### Razorpay Webhook Secret (TEST MODE)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Ensure dashboard is in **TEST** mode (top-right)
3. Settings → Webhooks → Add Webhook
4. Fill form:
   - **URL**: (Leave for now, will update after deployment)
   - **Secret**: Generate random secret, copy it
   - **Events**: Check `payment.captured`
5. Save and get the secret:
   ```
   RAZORPAY_WEBHOOK_SECRET_TEST=whsec_...
   ```

### Resend API Key

1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Create new API key if needed
3. Copy:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM=Payments <payments@yourdomain.com>
   ```
   (Replace `yourdomain.com` with your actual domain registered in Resend)

## Step 2: Deploy Edge Function

### Clone/Pull Latest Code

```bash
cd ai-vibecode-n8n-cohort
git pull origin main
```

### Set Supabase Secrets

```bash
supabase secrets set --project-ref huknwlunnneuigofixcz \
  RAZORPAY_ENV=test \
  RAZORPAY_WEBHOOK_SECRET_TEST="your-test-webhook-secret-here" \
  RAZORPAY_WEBHOOK_SECRET_LIVE="your-live-webhook-secret" \
  RESEND_API_KEY="re_your_resend_api_key" \
  EMAIL_FROM="Payments <payments@yourdomain.com>"
```

**Note**: Replace with your actual credentials. The LIVE secret can be a placeholder for now.

### Deploy Function

```bash
# Deploy to Supabase
supabase functions deploy razorpay-webhook --project-ref huknwlunnneuigofixcz

# Output will show:
# Deploying function razorpay-webhook...
# ✓ Function razorpay-webhook deployed
# Endpoint: https://huknwlunnneuigofixcz.functions.supabase.co/razorpay-webhook
```

**Copy the Endpoint URL** - you'll need it for Razorpay.

## Step 3: Complete Razorpay Webhook Setup

1. Go back to Razorpay Dashboard → Settings → Webhooks
2. Find the webhook you created earlier
3. **Edit** the webhook and set:
   - **URL**: `https://huknwlunnneuigofixcz.functions.supabase.co/razorpay-webhook`
   - Keep **Secret** the same
4. **Test Delivery**: Click "Test" button to verify
   - Should see a successful delivery (green checkmark)

## Step 4: Verify Payments Table

Check that the `payments` table exists in Supabase:

```bash
# Open Supabase SQL Editor
# Run query:
SELECT * FROM public.payments LIMIT 1;

# Should return empty table (no error)
```

## Step 5: Test with Test Payment

### Trigger Test Payment

1. In Razorpay Dashboard (TEST MODE):
   - Click "Create Test Payment"
   - Card: `4111 1111 1111 1111` (Visa)
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Complete payment

### Verify in Supabase

```bash
# In SQL Editor:
SELECT payment_id, amount, email, status FROM public.payments ORDER BY created_at DESC LIMIT 1;
```

Should show the test payment!

### Check Email

Check the email address used in test payment - should have received confirmation email from `payments@yourdomain.com`

## Step 6: Monitor Logs

### View Function Logs

```bash
# Via Supabase Dashboard:
# Go to: Project > Logs > Edge Functions
# Filter by function: razorpay-webhook
# View any errors

# Or via CLI:
supabase functions logs razorpay-webhook --project-ref huknwlunnneuigofixcz
```

## Production Deployment (LIVE MODE)

### Get Live Credentials

1. **Switch Razorpay to LIVE mode** (toggle top-right)
2. Get Live API keys (will be different from test)
3. Create LIVE webhook:
   - Settings → Webhooks → Add Webhook (same URL)
   - Generate new secret for LIVE
   - Save webhook

### Update Secrets

```bash
supabase secrets set --project-ref huknwlunnneuigofixcz \
  RAZORPAY_ENV=live \
  RAZORPAY_WEBHOOK_SECRET_LIVE="your-live-webhook-secret"
```

### Redeploy

```bash
supabase functions deploy razorpay-webhook --project-ref huknwlunnneuigofixcz
```

### Production Checklist

- [ ] Razorpay is in LIVE mode
- [ ] LIVE webhook secret is set in Supabase
- [ ] Email domain is verified in Resend
- [ ] Deployed new function with `RAZORPAY_ENV=live`
- [ ] Tested 1-2 real payments
- [ ] Verified payments appear in database
- [ ] Verified confirmation emails are sent
- [ ] Logs show no errors
- [ ] Set up email allowlist in Resend (if free tier)
- [ ] Notified team about production deployment

## Troubleshooting

### "Invalid signature" errors

```bash
# Check secret matches Razorpay:
supabase secrets list --project-ref huknwlunnneuigofixcz | grep RAZORPAY

# Verify against Razorpay dashboard Settings > Webhooks
```

### Function not receiving webhooks

```bash
# Test endpoint manually:
curl -X POST https://huknwlunnneuigofixcz.functions.supabase.co/razorpay-webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: test" \
  -d '{"event": "payment.captured", "payload": {"payment": {"entity": {"id": "test", "amount": 5000, "currency": "INR", "email": "test@example.com", "status": "captured"}}}}'

# Should return 200 OK
```

### Payments not in database

```bash
# Check RLS policy:
SELECT tablename, schemaname FROM pg_tables WHERE tablename='payments';

# Verify service role key is correct:
supabase secrets list --project-ref huknwlunnneuigofixcz
```

### Emails not sending

1. Verify `EMAIL_FROM` domain is verified in Resend
2. Check Resend dashboard for failed deliveries
3. Ensure `RESEND_API_KEY` is correct

## Rollback

If issues occur:

```bash
# Pause webhook in Razorpay: Settings → Webhooks → Disable

# Check logs for error details
supabase functions logs razorpay-webhook --project-ref huknwlunnneuigofixcz

# Fix code, then redeploy
supabase functions deploy razorpay-webhook --project-ref huknwlunnneuigofixcz
```

## Support & Monitoring

- **Supabase Logs**: Monitor in real-time in dashboard
- **Razorpay Logs**: Check webhook delivery status
- **Resend Dashboard**: Monitor email delivery
- **Database**: Query `payments` table for transaction history

## Next Steps

1. Create order on your platform
2. Integrate Razorpay checkout (client-side)
3. On successful payment, Razorpay sends webhook
4. Edge Function processes and stores payment
5. Customer receives confirmation email
6. Your backend can query `payments` table for order fulfillment
