# Job Openings Kenya — VPS Deployment Guide

## Overview
- **Domain:** Purchased from HostPinnacle
- **VPS:** `kings@13.140.164.95` (SSH access)
- **App:** Next.js 16 (Turbopack) | Port `3000`
- **Existing:** 2 other projects already running on this VPS

---

## Step 1: Point Domain to Your VPS (HostPinnacle DNS)

Log into your **HostPinnacle** account and update DNS records:

### Option A: Use HostPinnacle's DNS Manager
1. Go to **Domains → Manage DNS** for `jobopeningskenya.co.ke`
2. Add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `@` | `13.140.164.95` | 3600 |
| **A** | `www` | `13.140.164.95` | 3600 |

3. Save and wait **5-30 minutes** for DNS propagation.

### Verify DNS is working:
```bash
nslookup jobopeningskenya.co.ke
# Should return: 13.140.164.95
```

---

## Step 2: SSH into Your VPS

```bash
ssh kings@13.140.164.95
```

---

## Step 3: Clone the Project

```bash
cd /home/kings

# Clone the repo
git clone https://github.com/steve-kings/Job_Openings_Kenya.git jobopeningskenya

cd jobopeningskenya
```

---

## Step 4: Set Up Environment Variables

```bash
# Create .env.local with all production environment variables
nano .env.local
```

Paste your complete `.env.local` content from local (copy from your local machine):

```env
NEXT_PUBLIC_SUPABASE_URL=https://mirumiwhnvoerzixblit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=6G3U/nuI7399BokPq4EMj91CGI9naxOnEHXOQjj120iuclfkhyAgrQ+sNB21NOHj2//5KDANgp6CTYtMzcPtHg==

NEXT_PUBLIC_SITE_URL=https://jobopeningskenya.co.ke

CLOUDINARY_CLOUD_NAME=dmpo1cynf
CLOUDINARY_API_KEY=392897139134462
CLOUDINARY_API_SECRET=p3YN6xcFsXUjOYguEIBG2C_MwWg

GROQ_API_KEY=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

BREVO_API_KEY=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

NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-8258366457584710

CRON_SECRET=1000jobs_cron_secure_2026

OPENWEATHER_API_KEY=8ec2d7c6eb5d73ff469f78dff47cdd3c
```

> ⚠️ **IMPORTANT:** Change `NEXT_PUBLIC_SITE_URL` to `https://jobopeningskenya.co.ke` (or your actual domain)

---

## Step 5: Install Dependencies & Build

```bash
# Install Node.js if not already (use nvm for version management)
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# nvm install 22
# nvm use 22

# Install dependencies
npm install

# Build the project
npm run build
```

> The build should complete with 67+ pages. Verify there are zero errors.

---

## Step 6: Configure PM2 (Process Manager)

PM2 keeps your app running 24/7 and auto-restarts on crash.

```bash
# Install PM2 globally if not installed
npm install -g pm2

# Start the app with PM2
pm2 start npm --name "jobopeningskenya" -- start

# The app runs on port 3000 by default

# Save PM2 process list (survives reboot)
pm2 save

# Auto-start PM2 on system boot
pm2 startup
# Follow the command PM2 outputs to enable startup
```

### Useful PM2 commands:
```bash
pm2 status              # Check all running apps
pm2 logs jobopeningskenya  # View app logs
pm2 restart jobopeningskenya  # Restart after code update
pm2 stop jobopeningskenya    # Stop the app
```

---

## Step 7: Configure Nginx (Reverse Proxy)

Since you have 2 other projects running, each needs its own server block.

```bash
# Create Nginx config for this site
sudo nano /etc/nginx/sites-available/jobopeningskenya
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name jobopeningskenya.co.ke www.jobopeningskenya.co.ke;

    # For Vercel-style cron jobs
    location /api/cron/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Allow only Vercel-style cron (or your server's IP)
        # Remove this after testing if you want public access
        allow all;
    }

    # Main app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Large upload support (for Cloudinary uploads)
        client_max_body_size 50M;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Public assets
    location /images/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

### Enable the site:

```bash
# Create symlink to enable
sudo ln -s /etc/nginx/sites-available/jobopeningskenya /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

> ### About your other 2 projects:
> Your existing sites have their own server blocks in `/etc/nginx/sites-available/` with different `server_name` values. Nginx routes traffic based on the domain name — so `jobopeningskenya.co.ke` goes to port 3000, while your other domains go to their respective ports. No conflicts!

---

## Step 8: SSL with Let's Encrypt (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d jobopeningskenya.co.ke -d www.jobopeningskenya.co.ke

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose redirect (option 2: redirect HTTP to HTTPS)

# Auto-renewal test
sudo certbot renew --dry-run
```

Certbot auto-renews every 90 days — no manual intervention needed.

---

## Step 9: Verify Everything

1. **Check PM2:** `pm2 status` — should show `jobopeningskenya` as `online`
2. **Check Nginx:** `sudo nginx -t` — should say "syntax is ok"
3. **Visit:** `https://jobopeningskenya.co.ke` — should load the site
4. **Test HTTPS:** `https://jobopeningskenya.co.ke` — should show padlock

---

## Step 10: Update Code (Future Deployments)

When you want to deploy new changes:

```bash
ssh kings@13.140.164.95
cd /home/kings/jobopeningskenya

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart the app
pm2 restart jobopeningskenya

# Check it's running
pm2 status
pm2 logs jobopeningskenya --lines 20
```

---

## Quick Reference

| What | Command |
|------|---------|
| **SSH into VPS** | `ssh kings@13.140.164.95` |
| **PM2 status** | `pm2 status` |
| **App logs** | `pm2 logs jobopeningskenya` |
| **Restart app** | `pm2 restart jobopeningskenya` |
| **Reload Nginx** | `sudo systemctl reload nginx` |
| **Nginx config test** | `sudo nginx -t` |
| **SSL renewal test** | `sudo certbot renew --dry-run` |
| **Check DNS** | `nslookup jobopeningskenya.co.ke` |

---

## Ports on Your VPS

| Port | Project |
|------|---------|
| 3000 | **Job Openings Kenya** (this project) |
| ? | Your other project 1 |
| ? | Your other project 2 |

> Nginx routes traffic by domain name, so all three sites can share ports 80 & 443. Each app just needs its own internal port.

---

## Troubleshooting

**Site shows 502 Bad Gateway:**
```bash
pm2 status          # Is the app running?
pm2 restart jobopeningskenya  # Try restarting
pm2 logs jobopeningskenya     # Check for errors
```

**SSL certificate fails:**
```bash
# Make sure DNS is pointing to VPS first
nslookup jobopeningskenya.co.ke

# Try again
sudo certbot --nginx -d jobopeningskenya.co.ke -d www.jobopeningskenya.co.ke
```

**Build fails on VPS:**
```bash
# Check Node.js version (needs 18+)
node -v

# Clear cache and rebuild
rm -rf .next
npm install
npm run build
```

**Images not loading:**
```bash
# Check .env.local has the correct NEXT_PUBLIC_SITE_URL
grep SITE_URL .env.local
# Should be: NEXT_PUBLIC_SITE_URL=https://jobopeningskenya.co.ke
```
