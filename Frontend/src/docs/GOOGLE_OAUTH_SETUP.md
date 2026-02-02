# Google OAuth Setup Guide for Flowversal

This guide will walk you through setting up Google OAuth authentication for Flowversal using Supabase.

## Prerequisites
- A Supabase project (you should already have this)
- A Google Cloud Console account
- Access to your Supabase dashboard

## Step 1: Configure Google Cloud Console

### 1.1 Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first

### 1.2 Configure OAuth Consent Screen
1. Click **Configure Consent Screen**
2. Choose **External** user type (or Internal if using Google Workspace)
3. Fill in the required information:
   - **App name**: Flowversal
   - **User support email**: info@flowversal.com
   - **Developer contact email**: info@flowversal.com
4. Add scopes (optional for basic auth):
   - `userinfo.email`
   - `userinfo.profile`
5. Click **Save and Continue**

### 1.3 Create OAuth Client ID
1. Return to **Credentials** → **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name: **Flowversal**
4. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
5. Add **Authorized redirect URIs**:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```
   
   ⚠️ **IMPORTANT**: Replace `YOUR_SUPABASE_PROJECT_ID` with your actual project ID
   
   You can find this in your Supabase dashboard URL:
   `https://app.supabase.com/project/YOUR_PROJECT_ID`

6. Click **Create**
7. **Copy the Client ID and Client Secret** - you'll need these next!

## Step 2: Configure Supabase

### 2.1 Access Supabase Authentication Settings
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your Flowversal project
3. Navigate to **Authentication** → **Providers** (in the left sidebar)

### 2.2 Enable Google Provider
1. Find **Google** in the list of providers
2. Toggle the **Enable** switch to ON
3. Paste your Google OAuth credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
4. Click **Save**

### 2.3 Configure Site URL (Important!)
1. Go to **Authentication** → **URL Configuration**
2. Set your **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3000`
   - `https://your-domain.com`
   - Any other URLs you want to allow
4. Click **Save**

## Step 3: Test the Integration

### 3.1 Test Login Flow
1. Go to your Flowversal app
2. Click "Continue with Google" on the login page
3. You should be redirected to Google's consent screen
4. After authorizing, you'll be redirected back to your app
5. Check that you're logged in successfully

### 3.2 Verify in Supabase
1. Go to **Authentication** → **Users** in Supabase
2. You should see your user account listed
3. The provider should show as "google"

## Step 4: Production Deployment

When deploying to production:

### 4.1 Update Google Cloud Console
1. Add your production domain to **Authorized JavaScript origins**
2. Add production redirect URI to **Authorized redirect URIs**:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```

### 4.2 Update Supabase
1. Update Site URL to your production domain
2. Add production domain to Redirect URLs

### 4.3 Environment Variables
Make sure your production environment has:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

### Common Issues

**Error: "redirect_uri_mismatch"**
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
- Check for trailing slashes - they should NOT be included

**Error: "Invalid client"**
- Double-check your Client ID and Client Secret in Supabase
- Make sure you copied them correctly without extra spaces

**Error: "Access blocked: This app's request is invalid"**
- Complete the OAuth consent screen configuration
- Add test users if using External user type
- Wait a few minutes for changes to propagate

**Redirect not working**
- Verify Site URL in Supabase matches your app's URL
- Check that redirect URLs include both http://localhost:3000 and production URL
- Clear browser cache and try again

### Enable Debug Logging

To see detailed auth logs in Supabase:
1. Go to **Logs** → **Auth Logs** in Supabase dashboard
2. Filter by "google" to see OAuth-related logs

## Security Best Practices

1. **Never commit secrets**: Don't commit Client Secret to git
2. **Use environment variables**: Store credentials in .env files
3. **Restrict domains**: Only allow your actual domains in Google Console
4. **Enable email verification**: Configure in Supabase settings
5. **Set up rate limiting**: Prevent brute force attacks

## Next Steps

After Google OAuth is working:

1. ✅ Test the complete login/logout flow
2. ✅ Verify user data is being stored correctly
3. ✅ Test on different browsers
4. ✅ Test on mobile devices
5. ✅ Set up error monitoring (optional)
6. ✅ Configure email templates in Supabase

## Need Help?

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- Contact support: info@flowversal.com

---

**Estimated Setup Time**: 15-20 minutes

**Last Updated**: December 2024
