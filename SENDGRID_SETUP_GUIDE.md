# SendGrid Email Service Setup Guide
## ExpatEats Application

This guide walks you through setting up SendGrid for email delivery in the ExpatEats application.

---

## Prerequisites

- A valid email address for sender verification
- Access to your domain's DNS settings (for domain authentication - optional but recommended)
- Credit card for paid plans (optional - free tier available)

---

## Step 1: Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Click **"Start for Free"** or **"Sign Up"**
3. Fill out the registration form:
   - Email address
   - Password
   - Complete CAPTCHA
4. Click **"Create Account"**
5. Check your email and verify your account

---

## Step 2: Complete Account Setup

After verification, you'll be prompted to complete your profile:

1. **Tell us about yourself**:
   - First Name
   - Last Name
   - Company Name: `ExpatEats`
   - Company Website: `expateatsguide.com`

2. **Choose your sending plan**:
   - **Free**: 100 emails/day forever (good for development)
   - **Essentials**: $19.95/month, 50,000 emails/month
   - **Pro**: $89.95/month, 100,000 emails/month

   > For development/testing, start with the **Free** tier. You can upgrade later.

3. Click **"Get Started"**

---

## Step 3: Complete Sender Identity Verification

SendGrid requires you to verify that you own the email address you'll send from.

### Option A: Single Sender Verification (Quick - For Development)

1. In the SendGrid dashboard, navigate to **Settings** → **Sender Authentication**
2. Under **"Sender Identity"**, click **"Verify a Single Sender"**
3. Click **"Create New Sender"**
4. Fill out the sender form:
   - **From Name**: `ExpatEats`
   - **From Email Address**: `noreply@expateatsguide.com` (or your email for testing)
   - **Reply To**: `hello@expateatsguide.com` (or your email)
   - **Company Address**: Your business address
   - **City**: Your city
   - **State**: Your state/province
   - **Zip Code**: Your postal code
   - **Country**: Your country
   - **Nickname**: `ExpatEats NoReply` (internal identifier)
5. Click **"Create"**
6. Check your email inbox for verification email
7. Click the verification link in the email
8. Your sender is now verified ✓

> **Note**: For testing, you can use your personal email (e.g., `you@gmail.com`) instead of a custom domain email.

### Option B: Domain Authentication (Recommended for Production)

Domain authentication improves deliverability and removes "via sendgrid.net" from emails.

1. In the SendGrid dashboard, navigate to **Settings** → **Sender Authentication**
2. Under **"Authenticate Your Domain"**, click **"Get Started"**
3. Select your DNS host (or "Other" if not listed)
4. Enter your domain: `expateatsguide.com`
5. **Advanced Settings** (optional):
   - Use automated security (recommended)
   - Use a branded link
6. Click **"Next"**

SendGrid will provide DNS records to add:

**Example DNS Records** (yours will be different):
```
Type: CNAME
Host: em1234.expateatsguide.com
Value: u1234567.wl123.sendgrid.net

Type: CNAME
Host: s1._domainkey.expateatsguide.com
Value: s1.domainkey.u1234567.wl123.sendgrid.net

Type: CNAME
Host: s2._domainkey.expateatsguide.com
Value: s2.domainkey.u1234567.wl123.sendgrid.net
```

7. Add these records to your domain's DNS settings
8. Return to SendGrid and click **"Verify"**
9. Wait for DNS propagation (can take up to 48 hours, usually faster)
10. Once verified, you'll see a green checkmark ✓

---

## Step 4: Create API Key

1. Navigate to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Configure the API key:
   - **API Key Name**: `ExpatEats Production` (or `Dev` for development)
   - **API Key Permissions**: Select **"Restricted Access"**
   - Expand **"Mail Send"** and check:
     - ✓ Mail Send (Full Access)
   - Leave other permissions unchecked (principle of least privilege)
4. Click **"Create & View"**

5. **Copy the API Key** immediately:
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   ⚠️ **CRITICAL**: This is shown only once! Save it securely.

6. Click **"Done"**

---

## Step 5: Update Your .env File

Open your `.env` file and update:

```bash
# Replace with your actual API key
SENDGRID_API_KEY=SG.your-actual-api-key-from-step-4

# Use your verified sender email
SENDGRID_VERIFIED_SENDER=noreply@expateatsguide.com

# Update other email addresses
ADMIN_EMAIL=admin@expateatsguide.com
SUPPORT_EMAIL=hello@expateatsguide.com
NEWSLETTER_EMAIL=newsletter@expateatsguide.com
```

> **Note**: All sender emails must be verified (either via Single Sender or Domain Authentication)

---

## Step 6: Verify Multiple Sender Addresses (Optional)

If you want to send from different email addresses (admin, support, newsletter), you need to verify each:

### If using Single Sender Verification:
1. Repeat Step 3 (Option A) for each email address:
   - `admin@expateatsguide.com`
   - `hello@expateatsguide.com`
   - `newsletter@expateatsguide.com`

### If using Domain Authentication:
Once your domain is authenticated, you can send from any email address on that domain without individual verification.

---

## Step 7: Test Email Sending

Test that your setup works:

1. Start your application with the updated `.env` file
2. Ensure `EMAIL_DEBUG=true` in `.env` for initial testing
3. Trigger a test email (e.g., register a new account)
4. Check your application logs for email debug output
5. Once working, set `EMAIL_DEBUG=false` to actually send emails
6. Check the recipient's inbox

### Test Email API (Optional Manual Test)

You can test directly with curl:

```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@expateatsguide.com"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "This is a test!"}]
  }'
```

---

## Step 8: Monitor Email Activity

1. Navigate to **Activity** in SendGrid dashboard
2. You'll see:
   - Emails sent
   - Delivery status
   - Bounces
   - Spam reports
   - Opens (if tracking enabled)
   - Clicks (if tracking enabled)

---

## Step 9: Configure Email Settings (Recommended)

### Unsubscribe Management

1. Go to **Settings** → **Tracking**
2. Enable **Subscription Tracking**:
   - This adds an unsubscribe link to all marketing emails
   - Configure custom unsubscribe text

### Click & Open Tracking

1. Go to **Settings** → **Tracking**
2. Enable **Click Tracking**:
   - Track which links recipients click
3. Enable **Open Tracking**:
   - Track when emails are opened

### IP Whitelisting (Optional - for security)

1. Go to **Settings** → **IP Access Management**
2. Add your server IP addresses that can use the API key

---

## Production Checklist

Before going to production:

- [ ] Domain authentication is verified (not just single sender)
- [ ] All sender email addresses are verified
- [ ] API key uses restricted permissions (not Full Access)
- [ ] Different API keys for dev/staging/production
- [ ] SENDGRID_API_KEY is in production environment variables
- [ ] Monitor deliverability in SendGrid dashboard
- [ ] Set up alerts for bounces and spam reports
- [ ] Privacy policy includes email practices
- [ ] Unsubscribe links work correctly
- [ ] Email templates tested on multiple clients
- [ ] Rate limiting configured to stay within plan limits

---

## Email Best Practices

### 1. Sender Reputation
- Use consistent sender addresses
- Authenticate your domain
- Monitor bounce and spam rates
- Don't send to purchased lists

### 2. Content Guidelines
- Include unsubscribe link in all marketing emails
- Use clear subject lines (avoid spam trigger words)
- Include physical mailing address in footer
- Make emails mobile-responsive
- Provide plain text alternative

### 3. Deliverability
- Warm up your sending (start small, increase gradually)
- Clean your email list regularly
- Monitor bounce rates (keep under 5%)
- Honor unsubscribe requests immediately
- Use double opt-in for newsletter

### 4. Compliance
- **CAN-SPAM**: Include unsubscribe, physical address
- **GDPR**: Get consent, allow data deletion, provide data export
- **CASL** (Canada): Get explicit consent before sending

---

## Troubleshooting

### Error: "The from address does not match a verified Sender Identity"
- **Cause**: Trying to send from unverified email
- **Solution**: Verify the sender email in SendGrid settings

### Error: "Permission denied, wrong credentials"
- **Cause**: Invalid or expired API key
- **Solution**:
  1. Check API key in `.env` matches SendGrid
  2. Verify API key has "Mail Send" permission
  3. Generate new API key if needed

### Emails Going to Spam
- **Solutions**:
  1. Set up domain authentication (SPF, DKIM, DMARC)
  2. Improve sender reputation (lower bounce rate)
  3. Avoid spam trigger words in subject/content
  4. Ensure recipients opted in
  5. Include unsubscribe link

### High Bounce Rate
- **Causes**: Invalid email addresses, full mailboxes, blocked domains
- **Solutions**:
  1. Validate email addresses before sending
  2. Remove hard bounces from list
  3. Monitor bounce reports in SendGrid
  4. Use double opt-in for subscriptions

### Hitting Rate Limits
- **Cause**: Sending too many emails for your plan
- **Solution**:
  1. Check your plan limits
  2. Implement email queueing
  3. Respect `EMAIL_RATE_LIMIT` in `.env`
  4. Upgrade plan if needed

### Email Templates Not Rendering
- **Cause**: Email client doesn't support HTML/CSS
- **Solutions**:
  1. Always provide plain text alternative
  2. Use email-safe HTML (tables, inline CSS)
  3. Test on multiple email clients
  4. Avoid complex CSS (flexbox, grid)

---

## SendGrid Plans Comparison

| Feature | Free | Essentials | Pro |
|---------|------|------------|-----|
| Emails/month | 100/day | 50,000 | 100,000 |
| Email API | ✓ | ✓ | ✓ |
| SMTP Relay | ✓ | ✓ | ✓ |
| Email validation | Limited | ✓ | ✓ |
| Dedicated IP | ✗ | ✗ | 1 included |
| Support | Self-serve | Email | Email + Chat |
| Price | $0 | $19.95/mo | $89.95/mo |

---

## Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [API Reference](https://docs.sendgrid.com/api-reference)
- [Email Best Practices](https://sendgrid.com/resource/email-best-practices/)
- [Deliverability Guide](https://sendgrid.com/resource/the-ultimate-guide-to-email-deliverability/)
- [Email Template Library](https://sendgrid.com/resource/email-template-library/)

---

## Support

If you encounter issues:
1. Check SendGrid Activity dashboard for delivery status
2. Review application logs for error messages
3. Consult SendGrid documentation
4. Contact SendGrid support (available on paid plans)
5. Contact the development team

---

Last Updated: 2025-11-15
