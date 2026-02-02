# Email Templates Setup Guide for Flowversal

This guide will help you configure email templates in Supabase for password reset, email verification, and other auth-related emails.

## Overview

Supabase provides customizable email templates for:
- **Confirm Signup** - Email verification when users sign up
- **Magic Link** - Passwordless login via email
- **Change Email Address** - Confirm new email when user changes it
- **Reset Password** - Send password reset link

## Step 1: Access Email Templates

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your Flowversal project
3. Navigate to **Authentication** → **Email Templates** (in left sidebar)

## Step 2: Configure SMTP Settings (Optional but Recommended)

By default, Supabase uses a basic email service with rate limits. For production, configure your own SMTP server.

### Option A: Use Gmail SMTP (Simple for Testing)

1. Go to **Settings** → **Authentication**
2. Scroll to **SMTP Settings**
3. Configure:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Password: your-app-password
   Sender Email: your-email@gmail.com
   Sender Name: Flowversal
   ```
4. **Note**: For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833)

### Option B: Use SendGrid (Recommended for Production)

1. Create account at [SendGrid](https://sendgrid.com/)
2. Generate API key
3. Configure in Supabase:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: your-sendgrid-api-key
   Sender Email: noreply@flowversal.com
   Sender Name: Flowversal
   ```

### Option C: Use AWS SES (Enterprise)

1. Set up AWS SES
2. Configure in Supabase:
   ```
   SMTP Host: email-smtp.us-east-1.amazonaws.com
   SMTP Port: 587
   SMTP User: your-aws-smtp-username
   SMTP Password: your-aws-smtp-password
   Sender Email: noreply@flowversal.com
   Sender Name: Flowversal
   ```

## Step 3: Customize Email Templates

### Reset Password Template

Navigate to **Email Templates** → **Reset Password**

**Subject:**
```
Reset your Flowversal password
```

**Message Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0E0E1F 0%, #1A1A2E 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #1A1A2E;">
    <tr>
      <td style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #00C6FF 0%, #9D50BB 50%, #6E8EFB 100%);">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Flowversal</h1>
        <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">AI & Automation Platform</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px; background: #1A1A2E;">
        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px;">Reset Your Password</h2>
        <p style="margin: 0 0 20px; color: #CFCFE8; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password for your Flowversal account. Click the button below to create a new password.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px 0; text-align: center;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00C6FF 0%, #9D50BB 50%, #6E8EFB 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
            </td>
          </tr>
        </table>
        <p style="margin: 20px 0 0; color: #CFCFE8; font-size: 14px; line-height: 1.6;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <p style="margin: 20px 0 0; color: #8B8BA3; font-size: 12px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #6E8EFB; word-break: break-all;">{{ .ConfirmationURL }}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; background: #0E0E1F; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="margin: 0 0 10px; color: #8B8BA3; font-size: 12px;">
          This link will expire in 24 hours.
        </p>
        <p style="margin: 0; color: #8B8BA3; font-size: 12px;">
          © 2024 Flowversal. All rights reserved.<br>
          Contact us: info@flowversal.com | +91 97194 30007
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Confirm Signup Template

Navigate to **Email Templates** → **Confirm Signup**

**Subject:**
```
Welcome to Flowversal - Verify your email
```

**Message Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Flowversal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0E0E1F 0%, #1A1A2E 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #1A1A2E;">
    <tr>
      <td style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #00C6FF 0%, #9D50BB 50%, #6E8EFB 100%);">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎉 Welcome to Flowversal!</h1>
        <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">AI & Automation Platform</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px; background: #1A1A2E;">
        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px;">Verify Your Email</h2>
        <p style="margin: 0 0 20px; color: #CFCFE8; font-size: 16px; line-height: 1.6;">
          Thanks for signing up! We're excited to have you on board. Click the button below to verify your email address and get started.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px 0; text-align: center;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00C6FF 0%, #9D50BB 50%, #6E8EFB 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email</a>
            </td>
          </tr>
        </table>
        <p style="margin: 20px 0 0; color: #CFCFE8; font-size: 14px; line-height: 1.6;">
          Once verified, you'll have access to:
        </p>
        <ul style="margin: 10px 0 0; padding-left: 20px; color: #CFCFE8; font-size: 14px; line-height: 1.8;">
          <li>AI-powered workflow automation</li>
          <li>Advanced form builder with 14+ field types</li>
          <li>15+ pre-built workflow templates</li>
          <li>Drag & drop workflow designer</li>
          <li>Real-time execution monitoring</li>
        </ul>
        <p style="margin: 20px 0 0; color: #8B8BA3; font-size: 12px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #6E8EFB; word-break: break-all;">{{ .ConfirmationURL }}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; background: #0E0E1F; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="margin: 0 0 10px; color: #8B8BA3; font-size: 12px;">
          This link will expire in 24 hours.
        </p>
        <p style="margin: 0; color: #8B8BA3; font-size: 12px;">
          © 2024 Flowversal. All rights reserved.<br>
          Contact us: info@flowversal.com | +91 97194 30007
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Magic Link Template

Navigate to **Email Templates** → **Magic Link**

**Subject:**
```
Sign in to Flowversal
```

**Message Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to Flowversal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0E0E1F 0%, #1A1A2E 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #1A1A2E;">
    <tr>
      <td style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #00C6FF 0%, #9D50BB 50%, #6E8EFB 100%);">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Flowversal</h1>
        <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">AI & Automation Platform</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px; background: #1A1A2E;">
        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px;">Sign In to Your Account</h2>
        <p style="margin: 0 0 20px; color: #CFCFE8; font-size: 16px; line-height: 1.6;">
          Click the button below to sign in to your Flowversal account. No password required!
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px 0; text-align: center;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00C6FF 0%, #9D50BB 50%, #6E8EFB 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Sign In</a>
            </td>
          </tr>
        </table>
        <p style="margin: 20px 0 0; color: #CFCFE8; font-size: 14px; line-height: 1.6;">
          If you didn't request this email, you can safely ignore it.
        </p>
        <p style="margin: 20px 0 0; color: #8B8BA3; font-size: 12px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="{{ .ConfirmationURL }}" style="color: #6E8EFB; word-break: break-all;">{{ .ConfirmationURL }}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; background: #0E0E1F; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="margin: 0 0 10px; color: #8B8BA3; font-size: 12px;">
          This link will expire in 1 hour.
        </p>
        <p style="margin: 0; color: #8B8BA3; font-size: 12px;">
          © 2024 Flowversal. All rights reserved.<br>
          Contact us: info@flowversal.com | +91 97194 30007
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Step 4: Configure URL Settings

1. Go to **Authentication** → **URL Configuration**
2. Set the following:

**Site URL:** `https://your-domain.com` (or `http://localhost:3000` for development)

**Redirect URLs:** (Add all these)
```
http://localhost:3000
http://localhost:3000/auth/callback
https://your-domain.com
https://your-domain.com/auth/callback
```

## Step 5: Test Email Templates

### Test Reset Password Email

1. Go to your app's login page
2. Click "Forgot Password"
3. Enter your email
4. Check your inbox for the email
5. Verify the design and links work

### Test Signup Email (When Email Confirmation is Enabled)

1. Sign up with a new email
2. Check inbox for verification email
3. Click the link to verify
4. Should redirect to your app

## Step 6: Production Checklist

Before going to production:

- [ ] Configure custom SMTP server (not default Supabase)
- [ ] Test all email templates
- [ ] Set production Site URL
- [ ] Add all redirect URLs
- [ ] Enable email confirmation for new signups
- [ ] Set appropriate rate limits
- [ ] Configure custom domain for emails (optional)
- [ ] Set up SPF/DKIM records for better deliverability
- [ ] Test on multiple email providers (Gmail, Outlook, etc.)

## Advanced Configuration

### Enable Email Confirmation for Signups

1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Toggle **Confirm email** to ON
4. Update server code to set `email_confirm: false` in signup endpoint

### Customize Email Rate Limits

1. Go to **Settings** → **Authentication**
2. Scroll to **Rate Limits**
3. Adjust limits as needed

### Add Custom Domain for Emails

1. Set up SPF records:
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. Set up DKIM keys (provided by your email service)

3. Configure in SMTP settings

## Troubleshooting

### Emails Not Sending

- Check SMTP credentials are correct
- Verify sender email is authorized
- Check Supabase logs (Logs → Auth Logs)
- Verify rate limits aren't exceeded

### Links Not Working

- Verify Site URL matches your app's URL
- Check redirect URLs include all necessary paths
- Ensure HTTPS in production

### Emails Going to Spam

- Set up SPF/DKIM records
- Use custom domain email
- Avoid spam trigger words
- Test email content with spam checkers

## Variables Available in Templates

Use these in your email templates:

- `{{ .ConfirmationURL }}` - The action link (verify, reset, etc.)
- `{{ .Token }}` - The confirmation token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your configured site URL
- `{{ .Email }}` - User's email address

## Next Steps

After configuring emails:

1. Update signup endpoint to require email confirmation
2. Test all email flows
3. Monitor email delivery rates
4. Set up email analytics (optional)
5. Configure welcome emails (optional, via triggers)

## Resources

- [Supabase Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration Guide](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Best Practices](https://supabase.com/docs/guides/auth/auth-email-best-practices)

---

**Need Help?**
- Email: info@flowversal.com
- Phone: +91 97194 30007
