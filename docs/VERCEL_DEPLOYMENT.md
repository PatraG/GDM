# Vercel Deployment Guide

**Complete guide for deploying the Geospatial Dental Modeler to Vercel**

---

## Prerequisites

- [x] GitHub repository with project code
- [x] Vercel account (free tier sufficient for testing)
- [x] Production Appwrite project configured (see APPWRITE_PRODUCTION.md)
- [x] All environment variables documented (see .env.example)

---

## Quick Start (5-Minute Deployment)

### Step 1: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository:
   - Click **"Import Git Repository"**
   - Select `geospasial-dental-modeler` from your repositories
   - Click **"Import"**

### Step 2: Configure Build Settings

Vercel auto-detects Next.js projects, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` |
| **Development Command** | `npm run dev` |
| **Root Directory** | `.` (project root) |
| **Node.js Version** | 18.x (default) |

**✅ No changes needed** - Accept defaults and proceed.

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add the following:

#### Required Variables

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_production_project_id

# Database
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id

# Collections
NEXT_PUBLIC_APPWRITE_SURVEYS_COLLECTION_ID=surveys
NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID=questions
NEXT_PUBLIC_APPWRITE_OPTIONS_COLLECTION_ID=options
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_RESPONDENTS_COLLECTION_ID=respondents
NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID=sessions
NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID=responses
NEXT_PUBLIC_APPWRITE_ANSWERS_COLLECTION_ID=answers

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ENABLE_LOGGING=true
```

**Important**: 
- Use **Production** Appwrite project credentials
- Do NOT use development/testing project IDs
- Keep Project ID and Database ID secret (use Vercel's encrypted storage)

#### Adding Variables in Vercel UI

1. Paste variable name in **"Key"** field (e.g., `NEXT_PUBLIC_APPWRITE_PROJECT_ID`)
2. Paste value in **"Value"** field
3. Select environment: **Production**, **Preview**, **Development** (usually check all)
4. Click **"Add"**
5. Repeat for all variables

**💡 Tip**: Copy from `.env.local` but replace with production values.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will provide a URL: `https://your-project-name.vercel.app`

---

## Post-Deployment Verification

### 1. Check Build Logs

After deployment completes:

1. Click **"View Build Logs"**
2. Verify no errors in:
   - `npm install` (dependency installation)
   - `npm run build` (Next.js build)
   - Linting and type checking

**Expected Output**:
```
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (12/12)
✓ Finalizing page optimization
```

### 2. Test Production Site

Visit your deployment URL and verify:

- [ ] Login page loads (`/login`)
- [ ] Can authenticate with test enumerator account
- [ ] Dashboard loads without errors
- [ ] Network status indicator appears when offline
- [ ] Forms load correctly
- [ ] Appwrite connection works (check browser console for errors)

**Quick Test Script**:
```bash
# Test public pages
curl -I https://your-project-name.vercel.app/login

# Expected: 200 OK

# Test authenticated pages (will redirect to login)
curl -I https://your-project-name.vercel.app/enumerator/home

# Expected: 307 Redirect to /login
```

### 3. Check Environment Variables

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Verify all variables are present
3. Check values are correct (click **"Edit"** to view)

**Common Issues**:
- ❌ Missing `NEXT_PUBLIC_` prefix → Client-side code can't access
- ❌ Wrong Project ID → Authentication fails
- ❌ Development database ID → Wrong data source

---

## Custom Domain Setup (Optional)

### 1. Add Domain to Vercel

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `survey.yourdomain.com`
4. Click **"Add"**

### 2. Configure DNS

#### Option A: Vercel Nameservers (Recommended)
Point your domain's nameservers to Vercel:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### Option B: CNAME Record
Add CNAME record in your DNS provider:
```
Type: CNAME
Name: survey (or subdomain)
Value: cname.vercel-dns.com
TTL: 3600
```

### 3. Wait for Propagation

- DNS changes take 5 minutes to 24 hours
- Vercel auto-provisions SSL certificate (Let's Encrypt)
- Site will be accessible via `https://survey.yourdomain.com`

---

## Automatic Deployments

### Git Integration

Vercel automatically deploys on:

| Event | Deployment Type | URL |
|-------|----------------|-----|
| Push to `main` | Production | `your-project.vercel.app` |
| Push to other branches | Preview | `branch-name-project.vercel.app` |
| Pull request opened | Preview | `pr-123-project.vercel.app` |

**No configuration needed** - works automatically.

### Preview Deployments

Every pull request gets a unique preview URL:

1. Create feature branch: `git checkout -b feature/new-survey`
2. Push changes: `git push origin feature/new-survey`
3. Open PR on GitHub
4. Vercel comments on PR with preview URL
5. Test changes before merging

**Example PR Comment**:
```
✅ Preview deployment ready
🔍 Inspect: https://vercel.com/your-org/project/abc123
🌐 Preview: https://feature-new-survey-project.vercel.app
```

---

## Environment Management

### Production vs Preview

Configure different settings per environment:

#### Production Only
```bash
NEXT_PUBLIC_APPWRITE_PROJECT_ID=prod_project_123
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### Preview/Development Only
```bash
NEXT_PUBLIC_APPWRITE_PROJECT_ID=dev_project_456
NEXT_PUBLIC_ENABLE_LOGGING=true
```

**How to Configure**:
1. Go to **Settings** → **Environment Variables**
2. Edit variable
3. Uncheck environments where it shouldn't apply
4. Click **"Save"**

### Updating Environment Variables

**After updating variables**:
1. Go to **Deployments**
2. Find latest deployment
3. Click **•••** → **"Redeploy"**
4. Check **"Use existing Build Cache"** for faster rebuild
5. Click **"Redeploy"**

**⚠️ Note**: Environment variable changes require redeploy to take effect.

---

## Performance Optimization

### Edge Network

Vercel automatically deploys to global edge network:

- **CDN Caching**: Static assets served from nearest edge location
- **Edge Functions**: API routes run closest to users
- **Automatic HTTPS**: SSL termination at edge
- **Brotli Compression**: Automatic asset compression

**No configuration needed** - enabled by default.

### Build Optimizations

Already configured in `next.config.ts`:

```typescript
{
  reactStrictMode: true,
  swcMinify: true,          // Fast JavaScript minification
  images: {
    domains: ['cloud.appwrite.io'],
    formats: ['image/avif', 'image/webp']
  },
  compress: true,            // Gzip compression
  poweredByHeader: false     // Remove X-Powered-By header
}
```

### Caching Strategy

Vercel caches based on headers:

| Resource | Cache Duration | Strategy |
|----------|---------------|----------|
| Static assets | 1 year | Immutable (hash-based) |
| HTML pages | 0 (revalidate) | Server-rendered on demand |
| API routes | 0 (revalidate) | Fresh data every request |
| Images | 1 year | Optimized via Next.js Image |

**Edge caching automatically handled by Vercel.**

---

## Monitoring & Logging

### Vercel Analytics (Built-in)

Enable in dashboard:

1. Go to **Analytics**
2. Click **"Enable Analytics"**
3. View:
   - Page views
   - Load times (Web Vitals)
   - Top pages
   - Traffic sources

**Free Tier**: 100K events/month

### Runtime Logs

View application logs:

1. Go to **Deployments**
2. Click on deployment
3. Click **"View Function Logs"**
4. See real-time logs from:
   - API routes
   - Server-side rendering
   - Middleware

**Log Retention**: 2 hours (free), 7 days (Pro)

### Error Tracking

Integrate Sentry for production error monitoring:

```bash
npm install @sentry/nextjs
```

**Configuration in `sentry.client.config.js`**:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## Rollback Procedures

### Instant Rollback

If production deployment has issues:

1. Go to **Deployments**
2. Find last known good deployment
3. Click **•••** → **"Promote to Production"**
4. Confirm promotion

**⏱️ Time to Rollback**: 30 seconds

### Rollback via Git

```bash
# Find commit to rollback to
git log --oneline

# Revert to previous commit
git revert HEAD

# Or reset (destructive)
git reset --hard abc123

# Force push to main
git push origin main --force
```

**⏱️ Time to Rollback**: 2-3 minutes (includes rebuild)

**See also**: [ROLLBACK.md](./ROLLBACK.md) for comprehensive rollback procedures.

---

## Security Best Practices

### Environment Variable Security

- ✅ **DO**: Use Vercel's encrypted environment variable storage
- ✅ **DO**: Regenerate API keys for production (don't reuse dev keys)
- ✅ **DO**: Limit Appwrite API key permissions (read-only where possible)
- ❌ **DON'T**: Commit `.env.local` to Git
- ❌ **DON'T**: Share production credentials in team chat
- ❌ **DON'T**: Use same Appwrite project for dev and production

### Headers Security

Already configured in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        }
      ]
    }
  ];
}
```

### Appwrite Security

1. **Whitelist Vercel Domain** in Appwrite Console:
   - Go to Appwrite Console → Settings → Platforms
   - Add platform: **Web App**
   - Hostname: `your-project.vercel.app`
   - Protocol: `HTTPS`

2. **Enable CORS**:
   - Appwrite Console → Settings → CORS
   - Add: `https://your-project.vercel.app`
   - Add custom domain: `https://survey.yourdomain.com`

3. **Review Permissions**:
   - Users collection: Authenticated users read/write own documents
   - Respondents: Enumerators read/write own respondents
   - Sessions: Enumerators manage own sessions
   - Responses: Enumerators submit, admins read all

---

## CI/CD Integration

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_APPWRITE_ENDPOINT: ${{ secrets.APPWRITE_ENDPOINT }}
          NEXT_PUBLIC_APPWRITE_PROJECT_ID: ${{ secrets.APPWRITE_PROJECT_ID }}
      
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

**Setup**:
1. Generate Vercel token: Settings → Tokens → Create
2. Add to GitHub Secrets: Settings → Secrets → Actions
3. Push to trigger deployment

---

## Troubleshooting

### Build Fails

**Error**: `Module not found: Can't resolve...`

**Solution**:
```bash
# Clear Vercel build cache
Deployments → Click deployment → Redeploy → Uncheck "Use existing Build Cache"
```

**Error**: `Type error: ...`

**Solution**: Fix TypeScript errors locally first:
```bash
npm run build          # Should pass locally
npm run type-check     # Verify types
```

### Environment Variables Not Working

**Symptom**: `process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID` is undefined

**Checklist**:
- [ ] Variable name starts with `NEXT_PUBLIC_` (for client-side access)
- [ ] Variable added to Vercel dashboard (Settings → Environment Variables)
- [ ] Deployment redeployed after adding variable
- [ ] No typos in variable name (case-sensitive)

### Authentication Fails

**Error**: `Appwrite service unavailable` or CORS errors

**Solution**:
1. Verify Vercel domain whitelisted in Appwrite Console
2. Check Appwrite project ID matches production project
3. Verify API endpoint is `https://cloud.appwrite.io/v1`
4. Check browser console for specific error messages

### Slow Page Loads

**Check**:
1. Vercel Analytics → Web Vitals
2. Identify slow pages
3. Common causes:
   - Large client-side bundles → Use dynamic imports
   - Blocking Appwrite queries → Add loading states
   - Missing indexes → See INDEX_OPTIMIZATION.md

**Optimization**:
```bash
# Analyze bundle size
npm run build
# Check .next/analyze/ output
```

---

## Cost Estimation

### Vercel Free Tier

| Resource | Free Limit | Overage Cost |
|----------|-----------|--------------|
| Bandwidth | 100 GB/month | $0.15/GB |
| Build time | 6,000 minutes/month | $0.005/minute |
| Serverless executions | 100 GB-Hours | $2.00/GB-Hour |
| Edge middleware | 1M invocations | $0.65/1M |

**Estimated Usage** (50 concurrent enumerators):
- Bandwidth: ~10-20 GB/month ✅ Within free tier
- Build time: ~100 minutes/month ✅ Within free tier
- Executions: ~5 GB-Hours/month ✅ Within free tier

**💰 Expected Cost**: $0/month (free tier sufficient)

### When to Upgrade to Pro ($20/month)

Consider Pro plan when:
- More than 100 GB bandwidth/month
- Need longer log retention (7 days vs 2 hours)
- Require password protection for preview deployments
- Need advanced analytics and observability
- Team collaboration features needed

---

## Next Steps

After successful deployment:

1. ✅ [Configure production Appwrite project](./APPWRITE_PRODUCTION.md)
2. ✅ [Set up monitoring and alerts](./MONITORING.md)
3. ✅ [Train enumerators on production system](./ENUMERATOR_GUIDE.md)
4. ✅ [Review rollback procedures](./ROLLBACK.md)
5. ✅ [Configure custom domain](#custom-domain-setup-optional) (if applicable)

---

## Related Documentation

- [Deployment Overview](./DEPLOYMENT.md) - General deployment guide
- [Appwrite Production Setup](./APPWRITE_PRODUCTION.md) - Production database configuration
- [Rollback Procedures](./ROLLBACK.md) - Emergency rollback guide
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

---

**Deployment Status**: ✅ Ready for production  
**Last Updated**: November 13, 2025  
**Maintained By**: Development Team
