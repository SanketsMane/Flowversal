# UPSTASH REDIS SETUP - STEP BY STEP (5 MINUTES)

## STEP 1: Open Upstash Console
1. Open your browser
2. Go to: [https://console.upstash.com/](https://console.upstash.com/)
3. Click "Sign up with GitHub" (fastest option)
   OR create account with email

## STEP 2: Create Database
Once logged in, you'll see the Upstash dashboard.

1. Click the green "Create Database" button
2. Fill in the form:
   - **Name:** flowversalai-prod
   - **Type:** Regional (selected by default)
   - **Region:** us-east-1 (or choose closest to your location)
3. Click "Create" button

## STEP 3: Copy Your Credentials
After creation, you'll see your database details page.

Look for these values and copy them:

1. **Endpoint:** This is your `REDIS_HOST`
   - Format: `abc-12345-production-abc123.upstash.io`
   
2. **Port:** This is your `REDIS_PORT`
   - Usually: `6379`
   
3. **Password:** Click "Show" button to reveal
   - This is your `REDIS_PASSWORD`

## STEP 4: Provide Credentials
Copy and paste the values in this format:

```env
REDIS_HOST=your-endpoint-here.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password-here
```

### EXAMPLE:
```env
REDIS_HOST=humble-shark-12345.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AXAbcdEFGH1234567890XYZ
```

---

- ⏱️  Target Time: 5 minutes
- ✅  Free tier available (10,000 commands/day)
- 🔒  Secure connection included
