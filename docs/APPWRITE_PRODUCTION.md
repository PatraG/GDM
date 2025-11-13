# Production Appwrite Project Setup

**Complete guide for creating and configuring a production Appwrite Cloud project**

---

## Overview

This guide walks through creating a **separate production Appwrite project** isolated from development/testing environments.

**Why Separate Projects?**
- ✅ Data isolation (development data doesn't affect production)
- ✅ Independent scaling and performance
- ✅ Separate API keys and security controls
- ✅ Safe testing without production impact
- ✅ Clear audit trail per environment

---

## Prerequisites

- [x] Appwrite Cloud account ([cloud.appwrite.io](https://cloud.appwrite.io))
- [x] Development project working and tested
- [x] Vercel account ready for deployment
- [x] Production data schema finalized

---

## Step 1: Create Production Project

### 1.1 Login to Appwrite Cloud

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign in with your account
3. Click **"Create project"**

### 1.2 Project Configuration

| Field | Value |
|-------|-------|
| **Project Name** | `Geospatial Dental Survey - Production` |
| **Project ID** | Auto-generated (e.g., `65abc123def456`) |
| **Region** | **Singapore** (ap-singapore-1) |
| **Description** | Production environment for oral health surveys |

**Important**: 
- Choose **Singapore** region for optimal performance (closest to your users)
- Copy the **Project ID** - you'll need it for environment variables

### 1.3 Save Project ID

After creation, copy the Project ID:

```bash
# Example format
NEXT_PUBLIC_APPWRITE_PROJECT_ID=65abc123def456789
```

**💡 Tip**: Store securely - you'll add this to Vercel environment variables.

---

## Step 2: Configure Platform

Add your production domain to allowed platforms.

### 2.1 Add Web Platform

1. In Appwrite Console, go to **Settings** → **Platforms**
2. Click **"Add Platform"** → **"Web App"**
3. Configure:

| Field | Value |
|-------|-------|
| **Name** | `Production Web App` |
| **Hostname** | `your-project.vercel.app` |
| **Protocol** | `HTTPS` |

4. Click **"Next"** → **"Create"**

### 2.2 Add Custom Domain (If Applicable)

If using custom domain (e.g., `survey.example.com`):

1. Click **"Add Platform"** → **"Web App"**
2. Configure:

| Field | Value |
|-------|-------|
| **Name** | `Production Custom Domain` |
| **Hostname** | `survey.example.com` |
| **Protocol** | `HTTPS` |

**⚠️ Important**: Must match exactly the domain users will access.

---

## Step 3: Create Database

### 3.1 Create Database

1. Go to **Databases** → **Create database**
2. Configure:

| Field | Value |
|-------|-------|
| **Database ID** | `oral_health_survey` |
| **Name** | `Oral Health Survey Database` |

3. Click **"Create"**

### 3.2 Save Database ID

```bash
NEXT_PUBLIC_APPWRITE_DATABASE_ID=oral_health_survey
```

---

## Step 4: Run Automated Setup Script

### 4.1 Prepare Environment

Create `.env.production` file:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_production_project_id

# Database
NEXT_PUBLIC_APPWRITE_DATABASE_ID=oral_health_survey

# Admin API Key (for setup script only)
APPWRITE_API_KEY=your_admin_api_key_from_appwrite_console

# Collections (will be created by script)
NEXT_PUBLIC_APPWRITE_SURVEYS_COLLECTION_ID=surveys
NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID=questions
NEXT_PUBLIC_APPWRITE_OPTIONS_COLLECTION_ID=options
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_RESPONDENTS_COLLECTION_ID=respondents
NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID=sessions
NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID=responses
NEXT_PUBLIC_APPWRITE_ANSWERS_COLLECTION_ID=answers
```

### 4.2 Generate API Key

1. In Appwrite Console, go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Configure:

| Field | Value |
|-------|-------|
| **Name** | `Production Setup Script` |
| **Expiration** | 1 day (temporary - delete after setup) |
| **Scopes** | Select ALL scopes (needed for collection creation) |

4. Copy the **Secret Key** and add to `.env.production`:
```bash
APPWRITE_API_KEY=your_secret_key_here
```

**⚠️ Security**: Delete this API key immediately after setup completes.

### 4.3 Run Setup Script

```bash
# Load production environment
export $(cat .env.production | xargs)

# Run setup script
npx tsx scripts/setup-appwrite.ts
```

**Expected Output**:
```
✅ Connected to Appwrite Cloud
✅ Database 'oral_health_survey' ready
✅ Creating collections...
  ✅ users collection created
  ✅ surveys collection created
  ✅ questions collection created
  ✅ options collection created
  ✅ respondents collection created
  ✅ sessions collection created
  ✅ responses collection created
  ✅ answers collection created
✅ Creating indexes...
  ✅ pseudonym_unique index created
  ✅ enumeratorId_index created
  ✅ sessionId_index created
  ✅ submittedAt_index created
✅ Setup complete!
```

**⏱️ Duration**: 2-3 minutes

### 4.4 Verify Collections

In Appwrite Console, go to **Databases** → `oral_health_survey`:

**Should see 8 collections**:
- [ ] users (UserRole enum, isActive boolean)
- [ ] surveys (title, description, status enum)
- [ ] questions (questionType enum, required boolean)
- [ ] options (optionText, optionValue)
- [ ] respondents (pseudonym unique, sex enum, ageRange enum)
- [ ] sessions (enumeratorId, respondentId, status enum)
- [ ] responses (sessionId, surveyId, status enum)
- [ ] answers (responseId, questionId, answerText/Value)

**Click into each collection and verify**:
- Attributes match schema
- Indexes created (pseudonym, enumeratorId, sessionId, submittedAt)
- Permissions configured

---

## Step 5: Configure Permissions

### 5.1 Users Collection

**Read Permissions**:
- `users` role (authenticated users can read all users)

**Write Permissions**:
- `admins` role (only admins can create/update/delete users)

**Permission Rules**:
```
Read: ["role:users"]
Create: ["role:admins"]
Update: ["role:admins"]
Delete: ["role:admins"]
```

### 5.2 Surveys, Questions, Options

**Read Permissions**:
- `users` role (all authenticated users)

**Write Permissions**:
- `admins` role (survey structure management)

**Permission Rules**:
```
Read: ["role:users"]
Create: ["role:admins"]
Update: ["role:admins"]
Delete: ["role:admins"]
```

### 5.3 Respondents Collection

**Read Permissions**:
- `users` role (enumerators see all respondents)
- `admins` role

**Write Permissions**:
- `enumerators` role (enumerators create respondents)
- Document owner (enumerator who created can update)

**Permission Rules**:
```
Read: ["role:users"]
Create: ["role:enumerators"]
Update: ["user:{enumeratorId}"] (document level)
Delete: ["role:admins"]
```

### 5.4 Sessions Collection

**Read Permissions**:
- `users` role (all authenticated)

**Write Permissions**:
- `enumerators` role (create sessions)
- Document owner (manage own sessions)

**Permission Rules**:
```
Read: ["role:users"]
Create: ["role:enumerators"]
Update: ["user:{enumeratorId}"]
Delete: ["role:admins"]
```

### 5.5 Responses & Answers

**Read Permissions**:
- `users` role (all authenticated - for dashboard)

**Write Permissions**:
- `enumerators` role (submit responses)
- Document owner (update draft responses)

**Permission Rules**:
```
Read: ["role:users"]
Create: ["role:enumerators"]
Update: ["user:{enumeratorId}"] (draft only)
Delete: ["role:admins"] (voiding)
```

**⚠️ Note**: Setup script already configures these permissions. Verify, don't re-apply.

---

## Step 6: Create Initial Admin User

### 6.1 Create Admin Account

1. Go to **Authentication** → **Users**
2. Click **"Create user"**
3. Configure:

| Field | Value |
|-------|-------|
| **Email** | `admin@example.com` (your admin email) |
| **Password** | Strong password (min 8 chars, mixed case, numbers, symbols) |
| **Name** | `Production Admin` |

4. Click **"Create"**

### 6.2 Add Admin to Users Collection

**Option A: Via Appwrite Console**

1. Go to **Databases** → `oral_health_survey` → `users`
2. Click **"Add Document"**
3. Fill in:

```json
{
  "userId": "admin_user_id_from_auth",
  "email": "admin@example.com",
  "name": "Production Admin",
  "role": "admin",
  "isActive": true
}
```

4. Click **"Create"**

**Option B: Via API Call (Recommended)**

```bash
# Use your API key temporarily
curl -X POST https://cloud.appwrite.io/v1/databases/oral_health_survey/collections/users/documents \
  -H "X-Appwrite-Project: your_project_id" \
  -H "X-Appwrite-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "unique()",
    "data": {
      "userId": "admin_user_id_from_auth",
      "email": "admin@example.com",
      "name": "Production Admin",
      "role": "admin",
      "isActive": true
    }
  }'
```

### 6.3 Verify Admin Access

1. Deploy application to Vercel (see VERCEL_DEPLOYMENT.md)
2. Visit production URL
3. Login with admin credentials
4. Should see **Admin Dashboard** with all features

---

## Step 7: Import Initial Survey Data

### 7.1 Export from Development

```bash
# From development environment
npx tsx scripts/export-surveys.ts > surveys-export.json
```

### 7.2 Review Export

Check `surveys-export.json` contains:
- Survey definitions
- Questions with proper questionTypes
- Options for single_choice/multiple_choice questions
- All required attributes

### 7.3 Import to Production

**Option A: Manual Import via Console**

1. Go to **Databases** → `oral_health_survey` → `surveys`
2. Click **"Add Document"**
3. Paste survey JSON
4. Repeat for questions and options

**Option B: Automated Import Script**

```bash
# Load production environment
export $(cat .env.production | xargs)

# Run import
npx tsx scripts/import-surveys.ts surveys-export.json
```

**Expected Output**:
```
✅ Imported 3 surveys
✅ Imported 45 questions
✅ Imported 120 options
✅ Import complete
```

### 7.4 Verify Surveys

1. Login to production app
2. Go to Enumerator → Surveys
3. Should see all imported surveys
4. Test opening a survey - questions should load

---

## Step 8: Security Hardening

### 8.1 Delete Setup API Key

1. Go to **Settings** → **API Keys**
2. Find **"Production Setup Script"** key
3. Click **"Delete"**
4. Confirm deletion

**⚠️ Critical**: Never leave admin API keys active longer than needed.

### 8.2 Review Authentication Settings

1. Go to **Authentication** → **Settings**
2. Configure:

| Setting | Value |
|---------|-------|
| **Session Length** | 30 days |
| **Password History** | 5 passwords |
| **Password Dictionary** | Enabled |
| **Personal Data** | Enabled (checks against name, email) |
| **Password Expiration** | 90 days (optional) |
| **JWT Expiration** | 15 minutes |
| **Session Alerts** | Enabled (email on new login) |

### 8.3 Enable Account Protection

| Setting | Value |
|---------|-------|
| **Max Password Attempts** | 10 |
| **Password Timeout** | 1 hour (after max attempts) |
| **Email Verification** | Optional (for enumerators) |
| **Phone Verification** | Disabled |

### 8.4 Configure Webhooks (Optional)

Set up webhooks for monitoring:

1. Go to **Settings** → **Webhooks**
2. Click **"Add Webhook"**
3. Configure:

**Authentication Events**:
```
Name: Authentication Monitor
URL: https://your-monitoring-service.com/webhook
Events: users.*.create, users.*.sessions.*
```

**Data Submission Events**:
```
Name: Submission Monitor
URL: https://your-monitoring-service.com/webhook
Events: databases.*.collections.responses.documents.*.create
```

---

## Step 9: Performance Configuration

### 9.1 Verify Indexes

Indexes should already be created by setup script. Verify:

1. Go to **Databases** → `oral_health_survey` → `respondents`
2. Click **"Indexes"** tab
3. Should see: **pseudonym_unique** (Unique)

4. Go to **sessions** collection → **Indexes**
5. Should see: **enumeratorId_index** (Key)

6. Go to **responses** collection → **Indexes**
7. Should see: 
   - **sessionId_index** (Key)
   - **submittedAt_index** (Key)

**See also**: [INDEX_OPTIMIZATION.md](./INDEX_OPTIMIZATION.md) for full index documentation.

### 9.2 Configure Rate Limits

1. Go to **Settings** → **Rate Limits**
2. Configure per collection:

| Collection | Reads/min | Writes/min |
|------------|-----------|------------|
| users | 1000 | 100 |
| surveys | 1000 | 10 |
| respondents | 500 | 200 |
| sessions | 500 | 200 |
| responses | 1000 | 300 |
| answers | 2000 | 1000 |

**Note**: Adjust based on actual usage patterns.

### 9.3 Enable Caching

**Appwrite Cloud automatically caches**:
- Collection schemas
- Frequently accessed documents
- Static assets

**No manual configuration needed.**

---

## Step 10: Backup Strategy

### 10.1 Configure Automatic Backups

**Appwrite Cloud includes automatic backups**:
- Daily snapshots retained for 7 days
- Point-in-time recovery available
- No configuration needed

### 10.2 Manual Export Script

Create backup script for critical data:

```bash
#!/bin/bash
# scripts/backup-production.sh

# Export surveys
npx tsx scripts/export-surveys.ts > "backups/surveys-$(date +%Y%m%d).json"

# Export respondents (anonymized)
npx tsx scripts/export-respondents.ts > "backups/respondents-$(date +%Y%m%d).json"

# Export responses
npx tsx scripts/export-responses.ts > "backups/responses-$(date +%Y%m%d).json"

echo "✅ Backup complete: $(date)"
```

**Run weekly**:
```bash
chmod +x scripts/backup-production.sh
crontab -e

# Add line (every Sunday at 2 AM):
0 2 * * 0 /path/to/backup-production.sh
```

---

## Step 11: Monitoring Setup

### 11.1 Enable Appwrite Monitoring

1. Go to **Settings** → **Usage**
2. Monitor:
   - API requests per hour
   - Bandwidth usage
   - Database operations
   - Storage usage

### 11.2 Set Up Alerts

1. Go to **Settings** → **Alerts**
2. Configure:

**High API Usage Alert**:
```
Metric: Requests per minute
Threshold: > 1000
Action: Email admin@example.com
```

**Database Storage Alert**:
```
Metric: Database size
Threshold: > 80% of quota
Action: Email admin@example.com
```

### 11.3 External Monitoring (Optional)

**UptimeRobot**: Monitor production URL
```
URL: https://your-project.vercel.app/api/health
Interval: 5 minutes
Alert: Email + SMS
```

**Sentry**: Error tracking
```bash
npm install @sentry/nextjs
# Configure in sentry.server.config.js
```

---

## Verification Checklist

After completing all steps, verify:

**Infrastructure**:
- [ ] Production project created in Appwrite Cloud
- [ ] Database `oral_health_survey` exists
- [ ] All 8 collections created with correct schema
- [ ] All 4 indexes created and verified
- [ ] Platform (Vercel domain) whitelisted
- [ ] Custom domain whitelisted (if applicable)

**Security**:
- [ ] Setup API key deleted
- [ ] Admin user created and tested
- [ ] Collection permissions configured correctly
- [ ] Authentication settings hardened
- [ ] Rate limits configured

**Data**:
- [ ] Initial surveys imported
- [ ] Questions and options linked correctly
- [ ] Test enumerator account created
- [ ] Test respondent created successfully
- [ ] Test session and response submitted

**Performance**:
- [ ] Indexes verified (see INDEX_OPTIMIZATION.md)
- [ ] Caching enabled
- [ ] Rate limits appropriate for load

**Monitoring**:
- [ ] Appwrite usage dashboard accessible
- [ ] Alerts configured
- [ ] Backup strategy in place
- [ ] External monitoring (optional) configured

**Deployment**:
- [ ] Environment variables added to Vercel
- [ ] Production build deployed
- [ ] Can login with admin credentials
- [ ] Can create respondent and session
- [ ] Can submit survey response
- [ ] Dashboard displays data correctly

---

## Post-Setup Tasks

### Create Test Enumerators

1. Login as admin
2. Go to Admin → Enumerators
3. Create 2-3 test enumerator accounts:

```
Name: Test Enumerator 1
Email: enumerator1@test.com
Password: (secure password)
```

4. Test login with enumerator account
5. Create test respondent
6. Start test session
7. Submit test survey response

### Train Production Users

1. Share enumerator credentials
2. Provide training on:
   - Creating respondents
   - Managing sessions
   - Submitting surveys
   - Handling errors (see TROUBLESHOOTING.md)
3. Monitor first submissions for issues

### Monitor Initial Usage

For first 48 hours:
- Check Appwrite usage dashboard daily
- Review error logs in Vercel
- Verify data quality (no missing fields)
- Monitor API performance (<100ms typical)
- Check for authentication issues

---

## Rollback Plan

If production setup has critical issues:

1. **Keep development environment running** - users can continue there
2. **Debug production separately** - don't rush fixes
3. **Use preview deployments** - test fixes before production
4. **Document all changes** - maintain audit trail

**See**: [ROLLBACK.md](./ROLLBACK.md) for complete rollback procedures.

---

## Cost Management

### Appwrite Cloud Pricing

**Free Tier** (Current):
- 75,000 MAUs (Monthly Active Users)
- 5 GB bandwidth
- 2 GB storage
- 750,000 function executions

**Estimated Usage** (50 enumerators):
- MAUs: ~50-100 ✅ Within free tier
- Bandwidth: ~500 MB/month ✅ Within free tier
- Storage: ~100 MB (surveys + responses) ✅ Within free tier

**💰 Expected Cost**: $0/month (free tier sufficient)

**When to Upgrade to Pro ($15/month)**:
- More than 75,000 active users
- More than 5 GB bandwidth
- Need advanced team features
- Require enhanced support SLA

---

## Maintenance Schedule

### Weekly
- [ ] Review usage metrics
- [ ] Check for failed API calls
- [ ] Verify backup completion
- [ ] Monitor response submission rates

### Monthly
- [ ] Review and rotate API keys (if any active)
- [ ] Check storage usage trends
- [ ] Audit user accounts (remove inactive)
- [ ] Review security logs

### Quarterly
- [ ] Update Appwrite SDK version
- [ ] Review collection schemas for optimization
- [ ] Analyze query performance (see INDEX_OPTIMIZATION.md)
- [ ] Load testing (if usage growing)

---

## Related Documentation

- [Appwrite Setup Guide](./APPWRITE_SETUP.md) - Development setup
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Deployment instructions
- [Index Optimization](./INDEX_OPTIMIZATION.md) - Database performance
- [Rollback Procedures](./ROLLBACK.md) - Emergency procedures
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues

---

**Production Status**: ✅ Ready for deployment  
**Last Updated**: November 13, 2025  
**Maintained By**: Development Team
