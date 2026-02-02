# Onboarding Flow Documentation

## How It Works

### 1. **Authentication Check** (`App.tsx`)
When a user visits the app, the authentication flow runs:

```typescript
// Check if user is authenticated
if (!auth.isAuthenticated) {
  return <AuthRequired />; // Show login page
}

// Check if onboarding is completed
if (auth.user && !auth.user.onboardingCompleted) {
  return <Onboarding onComplete={() => window.location.reload()} />;
}

// Show main app
return <AuthenticatedDashboard />;
```

### 2. **Initial Login**
When a user logs in (demo or real):
- `onboardingCompleted` is set to `false` by default
- User is redirected to onboarding screen

### 3. **Onboarding Process** (`Onboarding.tsx`)
User goes through 5 steps:
1. **Discovery** - How did you hear about Flowversal?
2. **Experience** - What's your automation experience?
3. **Organization** - Company size and name
4. **Tech Stack** - Which apps will you use?
5. **Goal** - What do you want to automate?

### 4. **Submitting Onboarding Data**
When user clicks "Get started":

```typescript
// 1. Send data to backend
POST /api/v1/users/me/onboarding
{
  referralSource: string,
  automationExperience: string,
  organizationSize: string,
  organizationName: string,
  techStack: string[],
  automationGoal: string
}

// 2. Backend saves data and sets onboardingCompleted = true in MongoDB

// 3. Frontend updates localStorage session
const session = JSON.parse(localStorage.getItem('flowversal_auth_session'));
session.user.onboardingCompleted = true;
localStorage.setItem('flowversal_auth_session', JSON.stringify(session));

// 4. Page reloads
window.location.reload();
```

### 5. **After Reload**
- Auth context loads user from localStorage
- `onboardingCompleted` is now `true`
- App.tsx shows `<AuthenticatedDashboard />` instead of onboarding

## Data Stored in MongoDB

All onboarding data is saved in the `users` collection:

```typescript
{
  supabaseId: 'demo-user-123',
  email: 'demo@flowversal.com',
  onboardingCompleted: true,
  organizationName: 'Acme Corp',
  organizationSize: 'Only Me',
  referralSource: 'search',
  automationExperience: 'none',
  techStack: ['Flowversal AI Agents', 'Google Sheets'],
  automationGoal: 'I want to automate...',
  createdAt: Date,
  updatedAt: Date
}
```

## Console Logs for Debugging

Look for these logs in the browser console:

### On Page Load
```
[AppDomain] Checking onboarding status: {
  userExists: true,
  userEmail: 'demo@flowversal.com',
  onboardingCompleted: false
}
[AppDomain] 📝 Showing onboarding flow (onboardingCompleted = false)
```

### On Onboarding Submit
```
[Onboarding] ✅ Onboarding completed successfully!
[Onboarding] Updated local session with onboardingCompleted = true
[Onboarding] 🔄 Reloading page to show main app...
```

### After Reload
```
[AppDomain] Checking onboarding status: {
  userExists: true,
  userEmail: 'demo@flowversal.com',
  onboardingCompleted: true
}
[AppDomain] ✅ User authenticated and onboarded, showing main app
```

## Troubleshooting

### Onboarding Shows Every Time
**Cause**: `onboardingCompleted` flag not being saved or loaded correctly

**Fix**:
1. Check browser console for errors
2. Check localStorage: `localStorage.getItem('flowversal_auth_session')`
3. Verify the session has `user.onboardingCompleted = true`
4. Clear localStorage and try again: `localStorage.clear()`

### Onboarding Submit Fails
**Cause**: Backend authentication or data save issues

**Fix**:
1. Check backend terminal for error logs
2. Check browser console for `[Onboarding]` error logs
3. Verify MongoDB is running
4. Run cleanup script: `cd App/Backend && npx ts-node scripts/cleanup-demo-users.ts`

### Can't Get Past Onboarding
**Cause**: Page reload not updating auth context

**Fix**:
1. Check that localStorage is being updated before reload
2. Verify auth service loads `onboardingCompleted` from session
3. Check browser console for `[AppDomain]` logs
4. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## TODO: Production-Ready Implementation

⚠️ Current implementation is a temporary development fix. For production:

1. **Fetch onboarding status from backend** after login
   ```typescript
   // After login, call:
   GET /api/v1/users/me
   // Response includes onboardingCompleted flag
   ```

2. **Store in Supabase user metadata** (optional)
   - Store `onboardingCompleted` in Supabase user_metadata
   - Eliminates need for separate backend call

3. **Remove demo login workarounds**
   - All users must use real Supabase authentication
   - Remove demo token bypass from backend

4. **Add proper error handling**
   - Show user-friendly error messages
   - Allow retry if save fails
   - Don't lose form data on error

5. **Add validation**
   - Validate organization name format
   - Limit automation goal length
   - Sanitize all input data

---

**Last Updated**: December 14, 2025
**Status**: Development (Temporary Fixes Active)
