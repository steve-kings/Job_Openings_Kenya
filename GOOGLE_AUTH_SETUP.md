# Google OAuth Setup Guide for YENA

## Overview
This guide will help you set up Google OAuth authentication for the YENA platform using Supabase.

## Prerequisites
- Supabase project (already set up)
- Google Cloud Console account
- Access to your Supabase dashboard

---

## Step 1: Get Supabase Callback URL

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your YENA project
3. Go to **Authentication** → **Providers**
4. Find the **Callback URL** at the top (it looks like):
   ```
   https://bmjrebjafjcvtfnxayhq.supabase.co/auth/v1/callback
   ```
5. **Copy this URL** - you'll need it for Google Cloud Console

---

## Step 2: Create Google OAuth Credentials

### 2.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### 2.2 Create a New Project (or select existing)
1. Click the project dropdown at the top
2. Click **"New Project"**
3. Name it: **"YENA Authentication"**
4. Click **"Create"**

### 2.3 Enable Google+ API
1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**

### 2.4 Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"Create"**

**Fill in the required fields:**
- **App name:** YENA - Youth Empowerment Network Africa
- **User support email:** Your email address
- **App logo:** (Optional) Upload YENA logo
- **Application home page:** https://yena.vercel.app
- **Authorized domains:** 
  - `vercel.app`
  - `supabase.co`
- **Developer contact information:** Your email address

4. Click **"Save and Continue"**
5. **Scopes:** Click **"Add or Remove Scopes"**
   - Select: `userinfo.email`
   - Select: `userinfo.profile`
   - Click **"Update"** then **"Save and Continue"**
6. **Test users:** (Optional for development)
   - Add your email and any test user emails
   - Click **"Save and Continue"**
7. Click **"Back to Dashboard"**

### 2.5 Create OAuth Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. **Application type:** Web application
4. **Name:** YENA Web Client

**Authorized JavaScript origins:**
```
https://yena.vercel.app
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://bmjrebjafjcvtfnxayhq.supabase.co/auth/v1/callback
http://localhost:54321/auth/v1/callback
```

5. Click **"Create"**
6. **IMPORTANT:** Copy the **Client ID** and **Client Secret** that appear

---

## Step 3: Configure Supabase

1. Go back to Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON**
5. Paste your **Client ID** from Google
6. Paste your **Client Secret** from Google
7. Click **"Save"**

---

## Step 4: Update Environment Variables

Add these to your `.env.local` file (already configured in code):

```env
NEXT_PUBLIC_SUPABASE_URL=https://bmjrebjafjcvtfnxayhq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Note:** These are already in your `.env.local` file, no changes needed.

---

## Step 5: Test Google Authentication

### Local Testing:
1. Run your development server: `npm run dev`
2. Go to: http://localhost:3000/login
3. Click **"Continue with Google"**
4. Sign in with your Google account
5. You should be redirected to the dashboard

### Production Testing:
1. Deploy to Vercel (already done)
2. Go to: https://yena.vercel.app/login
3. Click **"Continue with Google"**
4. Sign in with your Google account
5. You should be redirected to the dashboard

---

## How It Works

### User Flow:
1. User clicks "Continue with Google" button
2. Redirected to Google sign-in page
3. User authorizes the app
4. Google redirects back to Supabase callback URL
5. Supabase creates/updates user in `auth.users` table
6. App callback creates profile in `profiles` table (if doesn't exist)
7. User redirected to dashboard (or admin if they're an admin)

### Code Implementation:

**Login Page** (`src/app/login/page.tsx`):
```typescript
const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${location.origin}/auth/callback`,
        },
    });
};
```

**Auth Callback** (`src/app/auth/callback/route.ts`):
- Exchanges code for session
- Creates profile if doesn't exist
- Redirects based on user role (admin → /admin, user → /dashboard)

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL.

### Error: "Access blocked: This app's request is invalid"
**Solution:** 
1. Check that Google+ API is enabled
2. Verify OAuth consent screen is configured
3. Make sure authorized domains are added

### User not redirected after login
**Solution:** 
1. Check browser console for errors
2. Verify callback URL is correct
3. Check Supabase logs in dashboard

### Profile not created
**Solution:** 
1. Check that `profiles` table exists
2. Verify RLS policies allow inserts
3. Check Supabase logs for errors

---

## Security Notes

1. **Never commit** Google Client Secret to Git
2. Keep Supabase Service Role Key secure
3. Use environment variables for all secrets
4. Enable RLS (Row Level Security) on all tables
5. Regularly rotate API keys

---

## Database Schema

The `profiles` table should have:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Note:** This is already in your `supabase-setup.sql` file.

---

## Production Checklist

- [ ] Google OAuth credentials created
- [ ] OAuth consent screen configured
- [ ] Supabase Google provider enabled
- [ ] Authorized redirect URIs added
- [ ] Tested login flow locally
- [ ] Tested login flow in production
- [ ] Verified profile creation works
- [ ] Checked admin role assignment works
- [ ] Verified email is captured correctly

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify all URLs match exactly
4. Test with different Google accounts
5. Check Google Cloud Console for API quotas

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
