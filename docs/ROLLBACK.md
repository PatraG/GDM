# Rollback Procedures

**Critical Reference Guide for Production Issues**

This document provides step-by-step rollback procedures for various failure scenarios in the Oral Health Survey Data Collection System.

**Last Updated**: November 13, 2025  
**Version**: 1.0

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [Rollback Decision Matrix](#rollback-decision-matrix)
- [Vercel Deployment Rollback](#vercel-deployment-rollback)
- [Database Rollback](#database-rollback)
- [Environment Variables Rollback](#environment-variables-rollback)
- [Emergency Procedures](#emergency-procedures)
- [Post-Rollback Verification](#post-rollback-verification)
- [Incident Documentation](#incident-documentation)

---

## Quick Reference

### Immediate Actions for Critical Failures

| Symptom | Action | Time to Execute |
|---------|--------|-----------------|
| Site completely down | [Vercel Instant Rollback](#instant-rollback-vercel-dashboard) | ~30 seconds |
| Authentication broken | [Revert environment variables](#environment-variables-rollback) | ~2 minutes |
| Database errors | [Check Appwrite status](#database-rollback) | ~5 minutes |
| Build failure | [Rollback via Git](#git-based-rollback) | ~3 minutes |
| Performance degradation | [Monitor and decide](#rollback-decision-matrix) | ~10 minutes |

---

## Rollback Decision Matrix

Use this matrix to determine if rollback is necessary:

### **CRITICAL - Immediate Rollback Required**

- ✗ Site is completely inaccessible (500 errors, infinite loading)
- ✗ Authentication system is broken (no one can login)
- ✗ Data corruption or data loss occurring
- ✗ Security vulnerability discovered in production
- ✗ Critical business functionality completely broken

**Action**: Rollback immediately, investigate later

---

### **HIGH - Rollback Within 15 Minutes**

- ⚠️ Major feature broken (e.g., survey submission fails)
- ⚠️ Error rate >5% of requests
- ⚠️ Performance degraded >50% (response time >4s)
- ⚠️ Specific user role completely blocked (all enumerators can't access)

**Action**: Attempt quick fix (5 min), otherwise rollback

---

### **MEDIUM - Evaluate and Plan**

- ⚠️ Minor feature broken (e.g., export button not working)
- ⚠️ Error rate 1-5% of requests
- ⚠️ UI issues (styling broken, layout issues)
- ⚠️ Non-critical functionality degraded

**Action**: Deploy hotfix within 1-2 hours, rollback if fix takes longer

---

### **LOW - Monitor and Schedule Fix**

- ℹ️ Visual glitches that don't block functionality
- ℹ️ Error rate <1% of requests
- ℹ️ Performance slightly degraded (response time 2-3s)
- ℹ️ Edge case bugs

**Action**: Monitor, schedule fix for next deployment cycle

---

## Vercel Deployment Rollback

### Instant Rollback (Vercel Dashboard)

**Use Case**: Previous deployment was working, current deployment is broken

**Time to Execute**: ~30 seconds

**Steps**:

1. **Login to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Access Deployments**
   - Click **Deployments** tab
   - View deployment history (sorted newest first)

3. **Identify Last Working Deployment**
   - Look for deployment with ✅ status before the problematic one
   - Verify timestamp (before issue reports started)
   - Check commit message to confirm it's the right version

4. **Promote to Production**
   - Click **⋯ (three dots)** on the last working deployment
   - Select **Promote to Production**
   - Confirm promotion

5. **Verification**
   - Wait 10-30 seconds for propagation
   - Test critical user flows:
     - Login as enumerator
     - Create session
     - Submit survey
   - Check error rate in Vercel logs

**Rollback Complete!**

---

### Git-Based Rollback

**Use Case**: Need to rollback code changes and redeploy

**Time to Execute**: ~3 minutes

**Prerequisites**: Git repository access, deployment auto-triggers on push

#### Option A: Revert Last Commit (Safe)

```bash
# 1. Navigate to project directory
cd /path/to/geospasial-dental-modeler

# 2. Check current status
git log --oneline -5

# 3. Revert the problematic commit (creates new commit)
git revert HEAD --no-edit

# 4. Push to trigger redeployment
git push origin 001-survey-workflow
```

**Advantages**: 
- ✅ Preserves git history
- ✅ Safe for shared branches
- ✅ Can be reverted again if needed

**Disadvantages**:
- ⏱️ Slightly slower (creates new commit)

---

#### Option B: Reset to Previous Commit (Fast but Risky)

```bash
# 1. Find the commit hash to rollback to
git log --oneline -10

# 2. Reset to that commit (e.g., abc1234)
git reset --hard abc1234

# 3. Force push (DANGER: overwrites remote history)
git push --force origin 001-survey-workflow
```

**⚠️ WARNINGS**:
- Only use if you're the sole developer
- Destroys commits after the reset point
- Can break other developers' work
- Use `git revert` instead if working in a team

**When to Use**: 
- Emergency situations
- Personal/solo projects
- After hours when no one else is pushing

---

#### Option C: Rollback Multiple Commits

```bash
# Revert last 3 commits
git revert HEAD~2..HEAD --no-edit

# Or reset to specific commit
git reset --hard abc1234
git push --force origin 001-survey-workflow
```

---

### Rollback Specific Files Only

**Use Case**: Only certain files are problematic

```bash
# 1. Checkout specific file from previous commit
git checkout HEAD~1 -- src/path/to/problematic-file.tsx

# 2. Commit the change
git add src/path/to/problematic-file.tsx
git commit -m "fix: Rollback problematic-file.tsx to previous version"

# 3. Push to deploy
git push origin 001-survey-workflow
```

---

## Database Rollback

### Appwrite Database Issues

**⚠️ CRITICAL**: Appwrite is a managed service - you cannot rollback the database itself, only configuration and application code.

### Scenario 1: Wrong Collection Configuration

**Problem**: Collection schema changed incorrectly

**Solution**:

1. **Check Appwrite Console**
   - Login: https://cloud.appwrite.io
   - Navigate to project → Databases → oral_health_survey

2. **Verify Schema**
   - Check collection attributes match plan.md specifications
   - Look for missing or incorrect attributes

3. **Fix via Console** (Manual):
   - Add missing attributes
   - Update attribute types if possible
   - **Cannot delete attributes** - create new collection if needed

4. **Fix via Script** (Automated):
   ```bash
   # Re-run setup script (idempotent)
   npm run setup:appwrite
   ```

---

### Scenario 2: Data Corruption

**Problem**: Bad data entered into database

**Solutions**:

#### Option A: Void Corrupted Records (Preferred)

```typescript
// Mark responses as voided instead of deleting
// Via admin dashboard: Submissions → Select → Void
```

#### Option B: Manual Database Fix (Rare)

1. Login to Appwrite Console
2. Navigate to Databases → oral_health_survey → [collection]
3. Find problematic document by $id
4. Edit document fields directly
5. Save changes

#### Option C: Restore from Backup (If Available)

```bash
# If you have Appwrite backup/restore configured
# Contact Appwrite support or use your backup solution
```

**⚠️ Prevention**: 
- Always test schema changes in development first
- Use soft deletes (status flags) instead of hard deletes
- Implement data validation at application level

---

### Scenario 3: Permission Rules Broken

**Problem**: Users can't access their data due to permission changes

**Solution**:

1. **Check Permissions in Appwrite Console**
   - Databases → oral_health_survey → [collection] → Settings → Permissions

2. **Verify Expected Permissions** (from plan.md):
   ```
   Read: role:enumerator, role:admin
   Create: role:enumerator, role:admin
   Update: role:enumerator, role:admin
   Delete: role:admin (only)
   ```

3. **Restore Correct Permissions**:
   - Manually via Console UI
   - Or re-run setup script:
     ```bash
     npm run setup:appwrite
     ```

---

## Environment Variables Rollback

### Scenario 1: Wrong Environment Variables Deployed

**Problem**: Changed environment variables broke authentication or database connection

**Vercel Solution**:

1. **Login to Vercel Dashboard**
   - Navigate to: Project → Settings → Environment Variables

2. **Check Recent Changes**
   - Vercel shows change history for environment variables
   - Identify what changed

3. **Restore Previous Values**
   - Edit each variable
   - Restore old value from .env backup or documentation

4. **Redeploy**
   - Go to Deployments
   - Click **⋯ → Redeploy** on latest deployment
   - Select "Use existing Build Cache" → **Redeploy**

**Time to Execute**: ~2 minutes

---

### Scenario 2: Environment Variable Mismatch

**Problem**: Production environment variables don't match development

**Solution**:

```bash
# 1. Compare environments
# Development: Check .env file
cat .env

# Production: Check Vercel dashboard
# Settings → Environment Variables

# 2. Identify mismatches
# Common issues:
# - Wrong Appwrite Project ID
# - Wrong Appwrite Endpoint
# - Missing variables

# 3. Update production to match
# Via Vercel dashboard or CLI:
vercel env pull .env.production
vercel env add VARIABLE_NAME production
```

---

## Emergency Procedures

### Complete Site Down (Nuclear Option)

**Use Case**: Everything is broken, need to take site offline temporarily

#### Option 1: Maintenance Mode (via Vercel)

1. Create `src/app/maintenance/page.tsx`:
   ```tsx
   export default function Maintenance() {
     return (
       <div className="flex min-h-screen items-center justify-center">
         <div className="text-center">
           <h1 className="text-2xl font-bold">System Maintenance</h1>
           <p className="mt-2">We'll be back shortly. Please try again in 10 minutes.</p>
         </div>
       </div>
     );
   }
   ```

2. Update `src/middleware.ts` to redirect all traffic:
   ```typescript
   if (!request.nextUrl.pathname.startsWith('/maintenance')) {
     return NextResponse.redirect(new URL('/maintenance', request.url));
   }
   ```

3. Deploy immediately

#### Option 2: Disable Deployment (Temporary)

1. Vercel Dashboard → Project → Settings
2. **Git** → Disable "Production Branch" deployment
3. Site becomes inaccessible
4. Re-enable when ready

---

### Data Loss Prevention

**If rollback might cause data loss**:

1. **Export Data First**:
   ```bash
   # Via admin dashboard
   # Admin → Submissions → Export All → Download CSV
   ```

2. **Backup Appwrite Collections**:
   - Appwrite Console → Database → Export
   - Save JSON export locally

3. **Then Proceed with Rollback**

---

## Post-Rollback Verification

### Critical Verification Checklist

After any rollback, verify these critical paths:

#### ✅ Authentication

- [ ] Enumerator can login
- [ ] Admin can login
- [ ] Logout works
- [ ] Session persistence works

#### ✅ Core Functionality

- [ ] Enumerator can create respondent
- [ ] Enumerator can create session
- [ ] Enumerator can select survey
- [ ] Enumerator can submit survey response
- [ ] GPS coordinates captured

#### ✅ Admin Functions

- [ ] Admin can view dashboard
- [ ] Admin can create enumerator account
- [ ] Admin can view submissions
- [ ] Admin can export data

#### ✅ Data Integrity

- [ ] Previously submitted data still visible
- [ ] No duplicate records created
- [ ] Respondent pseudonyms still unique

#### ✅ Performance

- [ ] Dashboard loads in <3 seconds
- [ ] Survey submission completes in <2 seconds
- [ ] No timeout errors

---

### Monitoring After Rollback

**First 15 minutes**:
- [ ] Check Vercel logs for errors
- [ ] Monitor error rate (should be <1%)
- [ ] Test all critical user flows
- [ ] Check user reports (if any)

**First 1 hour**:
- [ ] Monitor performance metrics
- [ ] Verify data submission rate is normal
- [ ] Check for any new error patterns
- [ ] Communicate status to stakeholders

**First 24 hours**:
- [ ] Review daily usage patterns
- [ ] Compare metrics to pre-deployment baseline
- [ ] Analyze any reported issues
- [ ] Plan permanent fix if rollback was temporary

---

## Incident Documentation

### Required Information to Record

After any rollback, document:

1. **Incident Details**:
   - Date/time issue discovered
   - Who reported it
   - Severity level (Critical/High/Medium/Low)
   - User impact (number of users affected)

2. **Root Cause**:
   - What change caused the issue
   - Commit hash or deployment ID
   - Why it wasn't caught in testing

3. **Rollback Actions**:
   - Time rollback initiated
   - Method used (Vercel UI, git revert, etc.)
   - Time rollback completed
   - Who performed rollback

4. **Impact**:
   - Downtime duration
   - Data loss (if any)
   - Number of failed transactions
   - User complaints received

5. **Prevention**:
   - What testing would have caught this
   - Process improvements needed
   - Monitoring/alerting gaps

---

### Incident Report Template

```markdown
# Incident Report: [Brief Description]

**Date**: YYYY-MM-DD  
**Severity**: Critical/High/Medium/Low  
**Status**: Resolved/Investigating/Ongoing

## Timeline

- **HH:MM** - Issue first detected
- **HH:MM** - Rollback initiated
- **HH:MM** - Rollback completed
- **HH:MM** - Verification complete

## Impact

- **Users Affected**: X enumerators, Y admins
- **Downtime**: X minutes
- **Data Loss**: None/[Description]
- **Failed Operations**: X survey submissions

## Root Cause

[Detailed explanation of what went wrong]

## Rollback Actions

[Step-by-step what was done to rollback]

## Permanent Fix

[What needs to be done to prevent recurrence]

## Action Items

- [ ] Update test coverage
- [ ] Add monitoring for [specific metric]
- [ ] Document new procedure
- [ ] Train team on [specific process]
```

---

## Rollback Testing

### Pre-Production Rollback Drill

**Recommended**: Practice rollback procedures quarterly

1. **Setup**:
   - Deploy to preview environment
   - Intentionally break something
   - Practice rollback

2. **Skills to Practice**:
   - Vercel instant rollback
   - Git revert workflow
   - Environment variable restoration
   - Communication procedures

3. **Time Goals**:
   - Critical rollback: <2 minutes
   - High priority rollback: <5 minutes
   - Medium priority rollback: <15 minutes

---

## Contacts and Escalation

### Escalation Path

| Level | Role | Contact | When to Escalate |
|-------|------|---------|------------------|
| L1 | On-call Developer | [Developer contact] | Initial rollback |
| L2 | Tech Lead | [Tech lead contact] | Rollback didn't resolve issue |
| L3 | Appwrite Support | support@appwrite.io | Database issues |
| L4 | Vercel Support | vercel.com/support | Platform issues |

### External Dependencies

| Service | Support | SLA |
|---------|---------|-----|
| Appwrite Cloud | support@appwrite.io | Business hours |
| Vercel | vercel.com/support | 24/7 for Pro+ |
| Domain/DNS | [Your provider] | Varies |

---

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Production deployment procedures
- [Troubleshooting FAQ](./TROUBLESHOOTING.md) - Common issues and solutions
- [Admin Guide](./ADMIN_GUIDE.md) - Admin dashboard features
- [Enumerator Guide](./ENUMERATOR_GUIDE.md) - End-user documentation

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Review Frequency**: Quarterly or after each incident  
**Maintained By**: Development Team
