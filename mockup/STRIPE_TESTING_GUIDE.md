# Stripe Checkout Testing Guide - ExpatEats Guide Purchases

This guide provides step-by-step instructions for testing the Stripe checkout integration for guide purchases on ExpatEats.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Stripe Setup](#stripe-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing the Purchase Flow](#testing-the-purchase-flow)
5. [Testing Webhooks](#testing-webhooks)
6. [Verifying Database Updates](#verifying-database-updates)
7. [Common Test Scenarios](#common-test-scenarios)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before testing, ensure you have:

- ✅ **Stripe Account** - Sign up at [stripe.com](https://stripe.com)
- ✅ **Development Environment Running** - Docker containers up and running
- ✅ **User Account** - A registered user account on the app
- ✅ **Stripe CLI** (Optional but recommended) - For webhook testing

---

## Stripe Setup

### 1. Create or Access Your Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for a new account or log in to existing account
3. **Enable Test Mode** - Toggle the "Test mode" switch in the top right corner

### 2. Get Your API Keys

1. Navigate to **Developers** → **API keys** in the Stripe Dashboard
2. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

3. Click **"Reveal test key"** for the Secret key
4. Copy both keys - you'll need them in the next step

### 3. Create a Webhook Endpoint (for local testing)

**Option A: Using Stripe CLI (Recommended)**

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe

   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases/latest
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```

4. Copy the webhook signing secret shown (starts with `whsec_`)

**Option B: Using ngrok (Alternative)**

1. Install ngrok: [https://ngrok.com/download](https://ngrok.com/download)

2. Start ngrok:
   ```bash
   ngrok http 3001
   ```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. In Stripe Dashboard:
   - Go to **Developers** → **Webhooks**
   - Click **"Add endpoint"**
   - Enter URL: `https://abc123.ngrok.io/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
   - Click **"Add endpoint"**
   - Copy the **Signing secret** (starts with `whsec_`)

---

## Environment Configuration

### 1. Update Your `.env` File

Add the following Stripe keys to your `.env` file in the project root:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
STRIPE_GUIDE_PRICE=2500  # Price in cents (€25.00)

# SendGrid (for email confirmations - optional for testing)
SENDGRID_API_KEY=your_sendgrid_key_here
FROM_EMAIL=noreply@expateatsguide.com

# Frontend URL (important for redirects)
FRONTEND_URL=http://localhost:3001
```

### 2. Restart Docker Containers

```bash
docker compose down
docker compose up -d
```

### 3. Verify Stripe Initialization

Check the logs to ensure Stripe is initialized:

```bash
docker compose logs app | grep -i stripe
```

You should see:
```
✅ Stripe initialized successfully
```

If you see `⚠️ STRIPE_SECRET_KEY not set`, check your `.env` file.

---

## Testing the Purchase Flow

### Step 1: Access the Resources Page

1. Open your browser and navigate to: `http://localhost:3001`
2. **Login** to your account
3. Click on **"Resources"** in the navigation menu
4. Click on the **"Lifestyle Guides"** tab

You should see 5 guides displayed with:
- Preview images
- Guide names
- Price (€25.00)
- "Purchase" buttons

### Step 2: Initiate a Purchase

1. Click the **"Purchase - €25.00"** button on any guide
2. You should be redirected to the Stripe Checkout page
3. The page should show:
   - Guide name (e.g., "ExpatEats Guide - beauty")
   - Price: €25.00
   - Payment form

### Step 3: Complete Test Payment

Use Stripe's test card numbers:

**Successful Payment:**
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/34`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

**Other Test Cards:**
- **Decline (generic):** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0000 0000 9995`
- **Expired card:** `4000 0000 0000 0069`
- **Processing error:** `4000 0000 0000 0119`

For more test cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

### Step 4: Complete the Checkout

1. Fill in the test card details
2. Fill in email (can be any email)
3. Click **"Pay"**
4. You should be redirected back to: `http://localhost:3001/guides/purchase-success?session_id=...`

### Step 5: Verify Success Page

The success page should show:
- ✅ Green checkmark with "Purchase Successful!"
- Guide name
- Amount paid (€25.00)
- Status: "Paid"
- **"View Guide Now"** button
- **"View All My Guides"** button

### Step 6: View Your Purchased Guide

1. Click **"View Guide Now"**
2. You should be taken to the PDF viewer at `/guides/{slug}`
3. The guide PDF should load and display

### Step 7: Verify Purchase Status on Resources Page

1. Go back to **Resources** → **Lifestyle Guides**
2. The guide you purchased should now show:
   - **"View Guide"** button (green)
   - **"Purchased"** badge with checkmark
   - Button should be clickable to view the guide

---

## Testing Webhooks

Webhooks are how Stripe notifies your server about payment events.

### 1. Verify Webhook is Running

**If using Stripe CLI:**
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

You should see:
```
Ready! Your webhook signing secret is whsec_... (^C to quit)
```

**If using ngrok:**
- Ensure ngrok is running and webhook endpoint is configured in Stripe Dashboard

### 2. Monitor Webhook Events

**In Stripe CLI:**
```bash
# In a separate terminal
stripe listen --forward-to localhost:3001/api/webhooks/stripe --print-json
```

**In Application Logs:**
```bash
docker compose logs -f app
```

### 3. Test Webhook Flow

1. Make a test purchase (follow steps in "Testing the Purchase Flow")
2. Watch the logs for webhook events:

Expected log output:
```
📥 Webhook received: checkout.session.completed
✅ Webhook signature verified: checkout.session.completed
📥 Webhook received: payment_intent.succeeded
✅ Webhook signature verified: payment_intent.succeeded
💰 Processing successful payment for User X, Guide Y
✅ Guide purchase completed: 123
```

### 4. Verify Email Confirmation (Optional)

If SendGrid is configured, you should receive a confirmation email with:
- Welcome message
- Guide access link
- Community invitation

---

## Verifying Database Updates

### 1. Check Payments Table

```bash
docker exec -it expatdb psql -U expatuser -d expatdb -c "SELECT id, user_id, guide_id, amount, status, stripe_payment_intent_id FROM payments ORDER BY created_at DESC LIMIT 5;"
```

Expected output:
```
 id | user_id | guide_id | amount | status    | stripe_payment_intent_id
----+---------+----------+--------+-----------+-------------------------
  1 |       2 |        1 |   2500 | succeeded | pi_xxx...
```

### 2. Check Guide Purchases Table

```bash
docker exec -it expatdb psql -U expatuser -d expatdb -c "SELECT id, user_id, guide_id, purchase_status, payment_provider FROM guide_purchases ORDER BY purchased_at DESC LIMIT 5;"
```

Expected output:
```
 id | user_id | guide_id | purchase_status | payment_provider
----+---------+----------+-----------------+-----------------
  1 |       2 |        1 | completed       | stripe
```

### 3. Check User's Guides

```bash
docker exec -it expatdb psql -U expatuser -d expatdb -c "SELECT gp.id, u.email, g.slug, gp.purchase_status FROM guide_purchases gp JOIN users u ON gp.user_id = u.id JOIN guides g ON gp.guide_id = g.id;"
```

---

## Common Test Scenarios

### Scenario 1: First-Time Purchase

1. Login with a new user account
2. Go to Resources → Lifestyle Guides
3. All guides should show "Purchase" button
4. Purchase a guide using test card `4242 4242 4242 4242`
5. Verify success page appears
6. Verify guide shows "Purchased" status

### Scenario 2: Attempting Duplicate Purchase

1. Login with a user who has already purchased a guide
2. Go to Resources → Lifestyle Guides
3. Previously purchased guide should show "View Guide" button
4. Button should not be disabled
5. Clicking should take you directly to the guide (not to purchase)

### Scenario 3: Failed Payment

1. Login to your account
2. Go to Resources → Lifestyle Guides
3. Click "Purchase" on any guide
4. Use declined test card: `4000 0000 0000 0002`
5. Stripe should show "Your card was declined"
6. Payment should NOT be recorded in database
7. Guide should still show "Purchase" button (not purchased)

### Scenario 4: Abandoned Checkout

1. Login to your account
2. Click "Purchase" on a guide
3. On Stripe Checkout page, click the "Back" arrow
4. You should return to the Resources page
5. Guide should still show "Purchase" button
6. No payment or purchase should be recorded

### Scenario 5: Multiple Guides Purchase

1. Login to your account
2. Purchase Guide 1 (Beauty)
3. Verify success and "Purchased" status
4. Go back to Resources
5. Purchase Guide 2 (Cleaning)
6. Verify success and "Purchased" status
7. Go to "My Guides" page (`/purchases`)
8. Both guides should appear in your library

---

## Troubleshooting

### Issue: "Payment system is currently unavailable"

**Solution:**
- Check that `STRIPE_SECRET_KEY` is set in `.env`
- Verify key starts with `sk_test_`
- Restart Docker containers
- Check logs: `docker compose logs app | grep -i stripe`

### Issue: Webhook signature verification failed

**Error in logs:** `❌ Webhook signature verification failed`

**Solution:**
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- If using Stripe CLI, make sure it's running
- If using ngrok, verify webhook endpoint is configured correctly
- Restart webhook listener

### Issue: Stuck on "Processing..." after clicking Purchase

**Solution:**
- Check browser console for errors (F12)
- Verify CSRF token endpoint is working: `curl http://localhost:3001/api/csrf-token`
- Check that user is logged in
- Verify network tab shows POST to `/api/guides/{id}/purchase`

### Issue: Success page shows "Error Verifying Purchase"

**Solution:**
- Check webhook is properly configured and running
- Verify payment intent was successful in Stripe Dashboard
- Check database to see if payment was recorded
- Look for errors in application logs

### Issue: Guide shows "Purchased" but can't view PDF

**Solution:**
- Check that guide file exists: `docker exec expat-app ls -la guides/full/`
- Verify guide URL in database matches actual file path
- Check PDF viewer logs for errors
- Try accessing guide directly: `http://localhost:3001/api/guides/{slug}/access`

### Issue: Preview images not loading

**Solution:**
- Verify previews exist: `docker exec expat-app ls -la guides/previews/`
- Check preview endpoint: `curl -I http://localhost:3001/api/guides/beauty/preview`
- Should return `200 OK` with `Content-Type: image/svg+xml`
- Regenerate previews if needed: `node scripts/generate-guide-previews.cjs`

---

## Testing Checklist

Use this checklist to ensure all functionality works:

- [ ] Resources page loads with all guides
- [ ] Preview images display correctly
- [ ] Prices show as €25.00
- [ ] "Purchase" button works for unauthenticated users (redirects to login)
- [ ] "Purchase" button initiates Stripe Checkout for authenticated users
- [ ] Test card payment completes successfully
- [ ] Redirect to success page after payment
- [ ] Success page shows correct purchase details
- [ ] "View Guide Now" button works
- [ ] Guide PDF loads and displays
- [ ] Purchased guide shows "Purchased" badge on Resources page
- [ ] "View Guide" button appears for purchased guides
- [ ] Cannot purchase same guide twice
- [ ] Failed payment test works (declined card)
- [ ] Abandoned checkout doesn't create purchase record
- [ ] Webhook events are received and processed
- [ ] Database records created correctly (payments + guide_purchases)
- [ ] Email confirmation sent (if SendGrid configured)
- [ ] Multiple guide purchases work
- [ ] "My Guides" page shows all purchased guides

---

## Stripe Dashboard Resources

While testing, monitor these Stripe Dashboard pages:

1. **Payments**: [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
   - View all test payments
   - Check payment status
   - See payment details

2. **Events**: [https://dashboard.stripe.com/test/events](https://dashboard.stripe.com/test/events)
   - Monitor webhook events
   - See event timeline
   - Debug webhook issues

3. **Customers**: [https://dashboard.stripe.com/test/customers](https://dashboard.stripe.com/test/customers)
   - View customer records
   - See purchase history

4. **Webhooks**: [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
   - Check webhook endpoint status
   - View webhook logs
   - Test webhook delivery

---

## Production Deployment Notes

Before deploying to production:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Update `.env`** with live Stripe keys:
   - Replace `sk_test_...` with `sk_live_...`
   - Replace `whsec_test_...` with `whsec_live_...`
3. **Configure production webhook endpoint**:
   - Add `https://yourdomain.com/api/webhooks/stripe`
   - Select same events as test mode
4. **Test with real card** (small amount)
5. **Verify email confirmations** work
6. **Monitor logs** for first few purchases
7. **Set up Stripe alerts** for payment failures

---

## Support & Resources

- **Stripe Testing Docs**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Stripe CLI Docs**: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- **Test Cards**: [https://stripe.com/docs/testing#cards](https://stripe.com/docs/testing#cards)
- **Webhook Testing**: [https://stripe.com/docs/webhooks/test](https://stripe.com/docs/webhooks/test)

---

**Happy Testing! 🚀**
