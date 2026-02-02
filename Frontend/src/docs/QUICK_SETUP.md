# Quick Setup Reference for Google OAuth

## Your Supabase Redirect URI

Copy this exact URL and paste it into Google Cloud Console:

```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

## Steps in 3 Minutes

### 1. Google Cloud Console (2 minutes)
1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Create OAuth Client ID (Web Application)
4. Add redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
5. **Copy Client ID and Secret**

### 2. Supabase Dashboard (1 minute)
1. Go to https://app.supabase.com/
2. Authentication → Providers
3. Enable Google
4. **Paste Client ID and Secret**
5. Save

### 3. Test
1. Click "Continue with Google" on login
2. Authorize
3. Done! ✅

## Need the Full Guide?

Click the "Setup Google OAuth" button on the login page or check `/docs/GOOGLE_OAUTH_SETUP.md`

## Contact
- Email: info@flowversal.com
- Phone: +91 97194 30007
