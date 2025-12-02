# YENA Platform - Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables in Vercel
Make sure these are set in your Vercel project settings:

**Go to**: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Verify Supabase Setup
- ✅ Database tables created (courses, opportunities, blog_posts, etc.)
- ✅ RLS policies enabled
- ✅ Storage buckets configured
- ✅ Authentication enabled

### 3. Build Settings in Vercel
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

## 🔧 Troubleshooting Common Errors

### Error: "Application error: a server-side exception has occurred"

**Possible Causes & Solutions:**

1. **Missing Environment Variables**
   - Check Vercel → Settings → Environment Variables
   - Ensure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
   - Redeploy after adding variables

2. **Database Connection Issues**
   - Verify Supabase project is active
   - Check if RLS policies allow public read access for published content
   - Test connection locally first

3. **Image Loading Issues**
   - All images should be in `/public/images/` directory
   - Use relative paths: `/images/img1.jpg`
   - Ensure images are committed to Git

4. **Dynamic Route Issues**
   - Pages using Supabase should have `export const dynamic = 'force-dynamic'`
   - Already fixed in: `/courses`, `/jobs`, `/blog`

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Step 2: Vercel Auto-Deploy
- Vercel automatically deploys when you push to main branch
- Check deployment status in Vercel dashboard

### Step 3: Verify Deployment
Visit these pages to ensure they work:
- ✅ Home: `https://your-domain.vercel.app/`
- ✅ About: `https://your-domain.vercel.app/about`
- ✅ Jobs: `https://your-domain.vercel.app/jobs`
- ✅ Courses: `https://your-domain.vercel.app/courses`
- ✅ Blog: `https://your-domain.vercel.app/blog`
- ✅ Contact: `https://your-domain.vercel.app/contact`
- ✅ Login: `https://your-domain.vercel.app/login`

## 📊 Check Vercel Logs

If you encounter errors:

1. Go to Vercel Dashboard
2. Click on your deployment
3. Click "Functions" tab
4. Look for error logs in the function that's failing
5. Common issues will show here with stack traces

## 🔍 Recent Fixes Applied

### Courses Page Fix (Latest)
- ✅ Added `export const dynamic = 'force-dynamic'`
- ✅ Added null checks for course data
- ✅ Improved image error handling
- ✅ Added fallback for missing thumbnails
- ✅ Added try-catch for database queries

### Other Improvements
- ✅ Mobile responsive hero sections
- ✅ Brand colors applied to all pages
- ✅ YENA logo as favicon
- ✅ Creative sliders on courses page
- ✅ Error boundaries for better UX

## 🆘 Still Having Issues?

### Check These:

1. **Vercel Function Logs**
   - Vercel Dashboard → Deployments → Click latest → Functions
   - Look for red error indicators

2. **Build Logs**
   - Check if build completed successfully
   - Look for any warnings or errors during build

3. **Environment Variables**
   - Make sure they're set for "Production" environment
   - Click "Redeploy" after adding new variables

4. **Database Access**
   - Test Supabase connection from Vercel's IP
   - Check RLS policies aren't blocking access

### Quick Test Commands

Test locally before deploying:
```bash
# Build locally
npm run build

# Start production server locally
npm start

# Check for errors
npm run lint
```

## 📝 Notes

- The build is successful ✅
- All routes are properly configured
- Dynamic routes are marked with `ƒ` in build output
- Static routes are marked with `○` in build output

## 🎯 Current Status

**Last Deployment**: Commit `796892a`
**Status**: All fixes applied
**Action Required**: Verify on Vercel after auto-deploy completes

---

**Need Help?** Check Vercel logs or contact support with the deployment URL and error digest.
