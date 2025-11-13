# Deployment Guide

**Oral Health Survey - Data Collection System**

This guide covers deployment to Vercel (recommended) and alternative deployment options.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
3. [Environment Variables](#environment-variables)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Alternative Deployments](#alternative-deployments)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- **GitHub Account** (for code repository)
- **Vercel Account** (free tier available)
- **Appwrite Cloud Account** or self-hosted Appwrite instance

### Required Information

- Appwrite project ID
- Appwrite database ID
- Appwrite endpoint URL
- Production domain name (e.g., `survey.yourdomain.com`)

---

## Vercel Deployment (Recommended)

### Why Vercel?

- ✅ Optimized for Next.js
- ✅ Automatic deployments on git push
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Preview deployments for branches
- ✅ Built-in analytics

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository:
   - Repository: `PatraG/GDM` or your fork
   - Branch: `001-survey-workflow` or `main`

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

**Root Directory:** Leave empty (project root)

### Step 3: Set Environment Variables

Add the following environment variables in Vercel dashboard:

#### Required Variables

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | `https://cloud.appwrite.io/v1` | Appwrite API endpoint |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | `6721abc123def456` | Your Appwrite project ID |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | `oral-health-survey` | Your database ID |
| `NEXT_PUBLIC_APP_URL` | `https://survey.yourdomain.com` | Production URL |
| `NODE_ENV` | `production` | Environment mode |

#### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_LOG_LEVEL` | `info` | Logging level (debug/info/warn/error) |

**🔒 Security Note:** All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets here.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Vercel will provide a URL: `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

---

## Environment Variables

### Local Development vs. Production

**Development (`.env.local`):**
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-dev-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=oral-health-survey-dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXT_PUBLIC_LOG_LEVEL=debug
```

**Production (Vercel):**
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-prod-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=oral-health-survey-prod
NEXT_PUBLIC_APP_URL=https://survey.yourdomain.com
NODE_ENV=production
NEXT_PUBLIC_LOG_LEVEL=info
```

### Separate Dev and Prod Appwrite Projects

**Recommended:** Use separate Appwrite projects for development and production.

**Benefits:**
- Test changes safely
- Prevent accidental data corruption
- Different access permissions
- Independent scaling

**Setup:**
1. Create second Appwrite project for production
2. Run database setup script on both projects
3. Use different project IDs in environment variables

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console.log in production code
- [ ] Error boundaries tested

### Appwrite Configuration

- [ ] Production Appwrite project created
- [ ] All collections created (see `docs/APPWRITE_SETUP.md`)
- [ ] Permissions configured correctly
- [ ] Indexes created for performance
- [ ] Test admin account created
- [ ] Test enumerator account created

### Environment Variables

- [ ] All required variables set in Vercel
- [ ] Correct Appwrite project ID (production)
- [ ] Correct database ID
- [ ] Production URL matches deployment
- [ ] No development URLs in production config

### Security

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured (see `vercel.json`)
- [ ] CORS configured in Appwrite
- [ ] Rate limiting considered
- [ ] No API keys in frontend code

### Testing

- [ ] Login/logout flow tested
- [ ] Enumerator workflow tested end-to-end
- [ ] Admin dashboard tested
- [ ] Mobile responsiveness verified
- [ ] GPS location permissions tested
- [ ] Offline/online behavior tested

---

## Post-Deployment Steps

### 1. Verify Deployment

**Check these URLs:**
- Homepage: `https://your-domain.com`
- Login: `https://your-domain.com/login`
- Dashboard redirects work
- API routes accessible

### 2. Create Admin Account

```bash
# Use Appwrite console to create first admin user
# Or use the API:

curl -X POST https://cloud.appwrite.io/v1/account \
  -H "X-Appwrite-Project: YOUR_PROJECT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "unique()",
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "name": "Admin User"
  }'

# Then update user role in database
```

### 3. Test Complete Workflow

1. **Admin Login**
   - Login as admin
   - Create test enumerator account
   - Verify dashboard loads

2. **Enumerator Login**
   - Login as enumerator
   - Register test respondent
   - Start session
   - Fill survey
   - Submit response
   - Close session

3. **Admin Review**
   - View submission in dashboard
   - Test void functionality
   - Export data (CSV/JSON)
   - Verify all filters work

### 4. Monitor for Errors

**Vercel Dashboard:**
- Check **Deployment** → **Logs** for runtime errors
- Review **Analytics** for traffic patterns
- Monitor **Performance** metrics

**Browser Console:**
- Open DevTools → Console
- Look for JavaScript errors
- Check Network tab for failed requests

### 5. Configure Monitoring (Optional)

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Alternative Deployments

### Option 1: Self-Hosted with Docker

**Create `Dockerfile`:**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

**Build and run:**
```bash
docker build -t survey-app .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
  -e NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id \
  survey-app
```

### Option 2: Netlify

1. Connect repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables
4. Deploy

**Note:** Next.js works best on Vercel (same company)

### Option 3: AWS Amplify

1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

### Option 4: Traditional VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/PatraG/GDM.git
cd GDM

# Install dependencies
npm ci

# Build
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start npm --name "survey-app" -- start

# Configure nginx reverse proxy
sudo nano /etc/nginx/sites-available/survey
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name survey.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

### Build Fails

**Error: TypeScript errors**
```bash
# Check locally first
npm run type-check
npm run lint
npm run build
```

**Error: Out of memory**
- Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run build`
- Use Vercel Pro plan for more resources

### Runtime Errors

**Error: "Failed to load Appwrite"**
- Check environment variables are set correctly
- Verify Appwrite endpoint is accessible
- Check CORS configuration in Appwrite

**Error: "Unauthorized" on login**
- Verify Appwrite project ID matches
- Check database ID is correct
- Ensure user exists in Appwrite

**Error: GPS not working**
- Ensure HTTPS is enabled (required for geolocation)
- Check browser permissions
- Test on mobile device

### Performance Issues

**Slow initial load:**
- Enable Vercel Analytics to identify bottlenecks
- Consider adding `next/image` optimization
- Review large dependencies

**Slow API calls:**
- Add indexes to Appwrite collections
- Review query complexity
- Consider caching strategies

### Deployment Issues

**Error: "Build command failed"**
- Check package.json scripts are correct
- Ensure all dependencies are in package.json
- Review build logs in Vercel dashboard

**Error: Environment variables not working**
- Verify variables are prefixed with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check variable names (case-sensitive)

---

## Rollback Procedure

### Vercel Rollback

1. Go to **Deployments** in Vercel dashboard
2. Find previous working deployment
3. Click **⋯ → Promote to Production**
4. Deployment instantly reverts

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin 001-survey-workflow

# Or rollback to specific commit
git reset --hard <commit-hash>
git push --force origin 001-survey-workflow
```

⚠️ **Warning:** Force push can affect other developers

---

## Production Monitoring

### Key Metrics to Monitor

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Error Rate | Vercel Logs | >1% of requests |
| Response Time | Vercel Analytics | >2 seconds |
| Uptime | UptimeRobot | <99.5% |
| Disk Usage | Appwrite Console | >80% |

### Health Check Endpoint

Consider adding `/api/health` endpoint:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

---

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor response times
- [ ] Review new submissions

### Weekly
- [ ] Export data backup
- [ ] Review void actions
- [ ] Check enumerator activity

### Monthly
- [ ] Update dependencies (`npm outdated`)
- [ ] Review security advisories
- [ ] Test backup restore
- [ ] Update documentation

---

## Security Hardening

### Headers (Already Configured in vercel.json)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Additional Recommendations

1. **Enable Vercel Authentication** for preview deployments
2. **Configure Appwrite API keys** with minimal permissions
3. **Set up Vercel Firewall** (Pro plan) for DDoS protection
4. **Enable Vercel Password Protection** for staging environments
5. **Review Appwrite audit logs** monthly

---

## Cost Estimates

### Vercel Hobby (Free)

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ❌ No analytics
- ❌ No password protection

**Suitable for:** Small teams (<10 enumerators)

### Vercel Pro ($20/month)

- ✅ Everything in Hobby
- ✅ Analytics
- ✅ Password protection
- ✅ Increased bandwidth (1TB)
- ✅ Priority support

**Suitable for:** Medium teams (10-50 enumerators)

### Appwrite Cloud

- Free tier: 75k executions/month
- Pro: $15/month (unlimited)

---

## Support

**Deployment Issues:**
- Vercel Discord: https://vercel.com/discord
- Appwrite Discord: https://appwrite.io/discord

**Documentation:**
- Vercel Docs: https://vercel.com/docs
- Appwrite Docs: https://appwrite.io/docs
- Next.js Docs: https://nextjs.org/docs

---

**End of Deployment Guide**

**Last Updated:** November 2025  
**Version:** 1.0
