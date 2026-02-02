# Authentication Quick Reference

## 🔑 Demo Credentials

```
Email: demo@demo.com
Password: demo@123
```

## 🌐 Routes

| URL | Purpose | Auth Required |
|-----|---------|---------------|
| `/` | Marketing site | No |
| `/app` | Dashboard | Yes |
| `/admin` | Admin panel | Yes (admin role) |
| `/marketing` | Marketing (explicit) | No |

## 📡 API Endpoints

### Signup
```typescript
POST https://${projectId}.supabase.co/functions/v1/make-server-020d2c80/auth/signup

Headers:
  Content-Type: application/json
  Authorization: Bearer ${publicAnonKey}

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"  // optional
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Update Profile
```typescript
POST https://${projectId}.supabase.co/functions/v1/make-server-020d2c80/auth/update-profile

Headers:
  Content-Type: application/json
  Authorization: Bearer ${accessToken}

Body:
{
  "name": "Updated Name",
  "avatar_url": "https://example.com/avatar.jpg"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Updated Name",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

## 🔧 Using Auth Service

### Import
```typescript
import { authService } from './services/auth.service';
import { useAuth } from './contexts/AuthContext';
```

### Signup
```typescript
const result = await authService.signUp(email, password, name);
if (result.success) {
  console.log('User created:', result.user);
} else {
  console.error('Error:', result.error);
}
```

### Login
```typescript
const result = await authService.login(email, password);
if (result.success) {
  console.log('Logged in:', result.user);
}
```

### Google OAuth
```typescript
const result = await authService.loginWithGoogle();
// Will redirect to Google, then back to app
```

### Update Profile
```typescript
const result = await authService.updateProfile({
  name: 'New Name',
  avatar: 'https://example.com/avatar.jpg'
});
```

### Logout
```typescript
await authService.logout();
```

### Get Current User
```typescript
const user = authService.getCurrentUser();
console.log(user?.name, user?.email);
```

### Check Auth Status
```typescript
const isLoggedIn = authService.isAuthenticated();
```

## 🎣 Using Auth Context (React Hooks)

### In Components
```typescript
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes
```typescript
function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/app" />;
  }
  
  return <div>Protected Content</div>;
}
```

### Role-Based Access
```typescript
function AdminPanel() {
  const { user } = useAuth();
  
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Panel</div>;
}
```

## 👤 User Metadata Structure

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: string;
  lastLogin?: string;
}
```

### Supabase user_metadata:
```typescript
{
  name: "John Doe",
  avatar_url: "https://example.com/avatar.jpg",
  role: "user",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-15T12:30:00.000Z"
}
```

## 🔐 Environment Variables

Required in production:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Server environment (Supabase Edge Functions):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

## 📧 Email Configuration

### Supabase Dashboard
1. Go to Authentication → Email Templates
2. Configure each template (Reset Password, Confirm Signup, Magic Link)
3. Set up SMTP under Settings → Authentication

### Template Variables
- `{{ .ConfirmationURL }}` - Action link
- `{{ .Token }}` - Confirmation token
- `{{ .Email }}` - User's email
- `{{ .SiteURL }}` - Your site URL

## 🔄 Session Management

### Auto-Refresh
Sessions automatically refresh 1 hour before expiry.

### Session Duration
Default: 24 hours

### Force Refresh
```typescript
const success = await authService.refreshSession();
```

### Clear Session
```typescript
await authService.logout();
// or manually:
localStorage.removeItem('flowversal_auth_session');
```

## 🛠️ Common Tasks

### Add New User (Server-side/Admin)
```typescript
const { data, error } = await supabase.auth.admin.createUser({
  email: 'user@example.com',
  password: 'password',
  user_metadata: {
    name: 'John Doe',
    role: 'user',
    created_at: new Date().toISOString(),
  },
  email_confirm: true,
});
```

### Update User Role (Server-side/Admin)
```typescript
const { data, error } = await supabase.auth.admin.updateUserById(
  userId,
  {
    user_metadata: {
      ...existingMetadata,
      role: 'admin',
    },
  }
);
```

### Get All Users (Server-side/Admin)
```typescript
const { data: { users }, error } = await supabase.auth.admin.listUsers();
```

### Delete User (Server-side/Admin)
```typescript
const { data, error } = await supabase.auth.admin.deleteUser(userId);
```

## 🐛 Debugging

### Check Session
```typescript
console.log('Session:', authService.getCurrentUser());
console.log('Is Authenticated:', authService.isAuthenticated());
console.log('Access Token:', authService.getAccessToken());
```

### View Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Logs → Auth Logs
3. Filter by email or user ID

### Common Errors

**"Email already registered"**
- User exists, use login instead

**"Invalid email or password"**
- Check credentials
- Demo: demo@demo.com / demo@123

**"Unauthorized"**
- Session expired, login again
- Check access token validity

**"Provider not enabled"**
- Google OAuth not configured
- Click "Setup Google OAuth" button

## 📱 Mobile Considerations

### Session Persistence
Sessions work on mobile browsers via localStorage.

### OAuth Redirect
Ensure redirect URLs include mobile deep links if needed.

### Touch Optimization
All auth forms are touch-friendly.

## 🔒 Security Checklist

- [ ] Never commit `.env` files
- [ ] Use HTTPS in production
- [ ] Rotate service role key regularly
- [ ] Enable email verification in production
- [ ] Set up rate limiting
- [ ] Monitor auth logs
- [ ] Use strong passwords (enforce in UI)
- [ ] Implement 2FA (future)

## 🚀 Deployment

### Environment Setup
1. Set environment variables in hosting platform
2. Configure Supabase URLs in dashboard
3. Set up custom domain (optional)
4. Configure SMTP for emails

### Production Checklist
- [ ] Google OAuth configured
- [ ] Email templates set up
- [ ] SMTP server configured
- [ ] Custom domain DNS
- [ ] SSL certificate
- [ ] Redirect URLs updated
- [ ] Rate limits configured

## 📞 Getting Help

### In-App
- Click "Setup Google OAuth" on login page
- Access Support via sidebar

### Documentation
- `/docs/GOOGLE_OAUTH_SETUP.md`
- `/docs/EMAIL_TEMPLATES_SETUP.md`
- `/docs/USER_METADATA_SETUP.md`

### Contact
- Email: info@flowversal.com
- Phone: +91 97194 30007

---

**Last Updated:** December 2024
**Version:** 2.0
