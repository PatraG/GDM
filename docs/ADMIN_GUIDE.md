# Administrator User Guide

**Oral Health Survey - Data Collection System**

Version: 1.0  
Last Updated: November 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Administrator Responsibilities](#administrator-responsibilities)
3. [Enumerator Management](#enumerator-management)
4. [Dashboard Overview](#dashboard-overview)
5. [Data Quality Control](#data-quality-control)
6. [Export and Reporting](#export-and-reporting)
7. [System Maintenance](#system-maintenance)
8. [Security Best Practices](#security-best-practices)

---

## Introduction

### Purpose of this Guide

This guide provides comprehensive instructions for administrators managing the Oral Health Survey Data Collection System. Administrators are responsible for:

- Managing enumerator accounts
- Monitoring data collection progress
- Quality control and void management
- Data export and reporting
- System configuration

### Prerequisites

- Administrator account credentials
- Understanding of survey methodology
- Basic knowledge of data privacy regulations (Indonesian PDP Law)

---

## Administrator Responsibilities

### Key Duties

| Responsibility | Frequency | Priority |
|----------------|-----------|----------|
| Create/manage enumerator accounts | As needed | High |
| Monitor dashboard daily | Daily | High |
| Review data quality | Weekly | High |
| Void erroneous responses | As needed | Medium |
| Export data for analysis | Monthly | Medium |
| Update system documentation | Quarterly | Low |

### Skills Required

- User account management
- Data quality assessment
- Basic data analysis
- Communication with enumerators
- Problem-solving

---

## Enumerator Management

### Creating New Enumerator Accounts

**When:** Before deploying enumerators to the field

**Steps:**

1. **Login** to admin dashboard
2. Navigate to **Enumerators** section
3. Click **Create New Enumerator**
4. Fill in the form:
   ```
   Email Address: enumerator@example.com (required)
   Password: Minimum 8 characters (uppercase, lowercase, number)
   Status: Active (default)
   Role: Enumerator (auto-set)
   ```

5. Click **Create Enumerator**

**✅ Success:**
- Green toast: "Enumerator created successfully"
- New account appears in list
- Email and password provided to enumerator

**📧 Communication Template:**

```
Subject: Survey System Access - New Account

Dear [Enumerator Name],

Your account for the Oral Health Survey Data Collection System has been created.

Login URL: https://your-survey-app.vercel.app
Email: [email@example.com]
Temporary Password: [password]

Please change your password after first login.

For questions, contact: [admin@example.com]

Best regards,
[Admin Name]
```

---

### Viewing Enumerator Details

**Steps:**

1. Go to **Enumerators** section
2. Click **View Details** on any enumerator
3. Review information:
   - Email address
   - Account status (Active/Suspended)
   - Creation date
   - Last login (future feature)
   - Active sessions count
   - Total responses count (future feature)

---

### Suspending Enumerator Accounts

**When to suspend:**
- Enumerator no longer working on project
- Security concern or policy violation
- Temporary leave or reassignment
- End of field work period

**Steps:**

1. Navigate to **Enumerators** section
2. Find the enumerator
3. Click **View Details** or toggle status directly
4. Change status to **Suspended**
5. Confirm action

**⚠️ Important Checks:**

- **Cannot suspend if enumerator has active sessions**
- System will show error: "Cannot suspend enumerator with active sessions"
- **Solution:** Contact enumerator to close all sessions first

**📋 Effect of Suspension:**
- ✅ Enumerator cannot login
- ✅ Existing data remains intact
- ✅ Can be reactivated later
- ❌ Does not delete historical responses

---

### Reactivating Suspended Accounts

**Steps:**

1. Find suspended enumerator
2. Change status from **Suspended** to **Active**
3. Confirm action
4. Notify enumerator they can login again

---

## Dashboard Overview

### Accessing the Dashboard

**URL:** `/admin/dashboard` (auto-redirected after admin login)

### Dashboard Sections

#### 1. Statistics Cards

Top row shows key metrics:

| Card | Metric | Description |
|------|--------|-------------|
| **Total Responses** | Count | All survey responses (submitted, draft, voided) |
| **Today's Submissions** | Count | Responses submitted today |
| **Active Enumerators** | Count | Enumerators with ≥1 response |
| **Status Breakdown** | Percentages | Submitted / Draft / Voided ratios |

**📊 Interpreting Statistics:**

- **High draft rate (>20%):** May indicate enumerator training issues or network problems
- **High void rate (>5%):** Review void reasons for patterns
- **Low active enumerators:** Check if accounts are suspended or enumerators need support

---

#### 2. Charts and Visualizations

**Bar Chart: Responses by Survey Type**
- Shows distribution across different surveys
- Helps identify popular vs. underutilized surveys
- Use to balance survey distribution

**Line Chart: Responses Over Time (30 days)**
- Daily response trend
- Identifies peak collection periods
- Detects slowdowns or issues

**📈 Chart Insights:**

- Flat line = No data collection (investigate)
- Sharp drop = Possible system or field issue
- Steady increase = Healthy data collection

---

#### 3. Submission Table

**Columns:**

| Column | Information | Purpose |
|--------|-------------|---------|
| Response ID | Unique identifier | Reference for void actions |
| Enumerator | Who collected data | Performance tracking |
| Respondent | Pseudonym code | Data linkage |
| Survey | Survey title | Distribution analysis |
| Submitted At | Date/time | Timeline tracking |
| Location | GPS coordinates | Geographic analysis |
| Status | Submitted/Draft/Voided | Quality control |
| Actions | Void button | Data management |

---

#### 4. Filters

**Available Filters:**

```
Date Range: From [Date] To [Date]
Enumerator: [Select dropdown]
Survey: [Select dropdown]
Status: [All/Submitted/Draft/Voided]
```

**Filter Combinations:**

- **Monitor specific enumerator:** Select enumerator + date range
- **Review survey quality:** Select survey + status
- **Daily review:** Set date to today + status = Submitted
- **Find issues:** Status = Draft + old date range

**🔄 Clear Filters:** Click "Clear All Filters" to reset

---

## Data Quality Control

### Void Response Functionality

**Purpose:** Remove erroneous or invalid responses from analysis

**When to void:**
- Duplicate submission (should be prevented by system)
- Data entry error (respondent info wrong)
- Survey conducted incorrectly
- Respondent withdrew consent post-submission
- Technical issue during collection

**⚠️ Cannot void:**
- Draft responses (incomplete)
- Already voided responses

---

### Voiding a Response

**Steps:**

1. Navigate to **Dashboard**
2. Use filters to find the response
3. Click **Void** button in Actions column
4. **Void Response Modal** appears:
   ```
   Response Details:
   - Response ID: [ID]
   - Respondent: [Pseudonym]
   - Survey: [Title]
   - Submitted: [Date/Time]
   ```

5. Enter **Void Reason** (required, minimum 10 characters)
   ```
   Example reasons:
   - "Duplicate submission detected for respondent R-2024-045"
   - "Enumerator confirmed wrong respondent selected"
   - "Survey protocol not followed - missing required consent"
   - "Technical error: GPS coordinates invalid"
   ```

6. Click **Confirm Void**

**✅ Success:**
- Green toast: "Response voided successfully"
- Status changes to "Voided"
- Void reason recorded
- Your admin ID recorded as "voidedBy"

**📋 Audit Trail:**
- Void action is logged with:
  - Who voided (admin user ID)
  - When voided (timestamp)
  - Why voided (reason text)
  - Original response data preserved

---

### Void Reason Best Practices

**Good Reasons:**
✅ "Duplicate - same respondent surveyed twice (R-2024-012)"
✅ "Data entry error - age recorded as 999 instead of 9"
✅ "Protocol violation - survey started before consent obtained"
✅ "GPS coordinates show location 500km from survey area"

**Poor Reasons:**
❌ "mistake" (too vague)
❌ "wrong" (no context)
❌ "delete this" (not descriptive)

---

### Monitoring Data Quality

**Weekly Quality Checks:**

1. **Response Rate Review**
   - Check responses per enumerator
   - Identify low performers
   - Provide additional training if needed

2. **Draft Analysis**
   - Review old drafts (>7 days)
   - Contact enumerators to complete or explain
   - Consider network issues if drafts are high

3. **Void Pattern Analysis**
   - Review void reasons
   - Identify systemic issues
   - Update training materials

4. **Geographic Distribution**
   - Check GPS coordinates for outliers
   - Verify coverage of target areas
   - Identify areas needing more coverage

---

## Export and Reporting

### Exporting Data

**Purpose:** Download responses for statistical analysis in external tools (SPSS, R, Excel)

**Export Formats:**

| Format | Use Case | File Type |
|--------|----------|-----------|
| **CSV** | Excel, SPSS, statistical software | `.csv` |
| **JSON** | Programming, databases | `.json` |

---

### CSV Export

**Steps:**

1. Go to **Dashboard**
2. Apply filters (optional):
   - Date range: Last 30 days
   - Status: Submitted only
   - Enumerator: Specific person

3. Click **Export CSV** button
4. File downloads automatically
5. Filename format: `responses-YYYY-MM-DD-HH-MM-SS.csv`

**CSV Columns:**

```
Response ID, Respondent, Enumerator, Survey, Version,
Status, Submitted At, GPS Latitude, GPS Longitude,
GPS Accuracy, Voided By, Void Reason
```

**📊 CSV Features:**
- Proper escaping for special characters
- UTF-8 encoding
- Compatible with Excel (open with "From Text" import)
- Filters applied to export

---

### JSON Export

**Steps:**

1. Apply filters if needed
2. Click **Export JSON** button
3. File downloads automatically
4. Filename format: `responses-YYYY-MM-DD-HH-MM-SS.json`

**JSON Structure:**

```json
[
  {
    "responseId": "6721abc...",
    "status": "submitted",
    "submittedAt": "2024-11-13T10:30:00.000Z",
    "respondent": {
      "id": "6721def...",
      "pseudonym": "R-2024-001",
      "age": 45,
      "sex": "female"
    },
    "survey": {
      "id": "6721ghi...",
      "title": "Oral Health Assessment",
      "version": "1.2"
    },
    "enumerator": {
      "id": "6721jkl...",
      "email": "enumerator@example.com"
    },
    "location": {
      "latitude": -6.2088,
      "longitude": 106.8456,
      "accuracy": 15.5
    },
    "voidInfo": {
      "voidedBy": null,
      "voidReason": null
    }
  }
]
```

**📋 JSON Features:**
- Nested structure for relationships
- Full metadata included
- Machine-readable
- API-compatible format

---

### Export Best Practices

**✅ Do:**
- Export regularly (weekly/monthly)
- Store exports securely
- Document export parameters
- Version control export files
- Validate export completeness

**❌ Don't:**
- Share exports via unsecured channels
- Mix production and test data
- Export PII without need
- Ignore data privacy regulations

---

### Data Analysis Workflow

```
1. Apply Filters (date range, status=submitted)
2. Export CSV
3. Open in Excel/SPSS/R
4. Join with question/answer data (separate export)
5. Perform statistical analysis
6. Generate reports
7. Archive raw exports
```

---

## System Maintenance

### Regular Tasks

**Daily:**
- [ ] Check dashboard statistics
- [ ] Review new submissions
- [ ] Monitor for errors or anomalies

**Weekly:**
- [ ] Review draft responses
- [ ] Analyze enumerator performance
- [ ] Export data for backup

**Monthly:**
- [ ] Full data export and archive
- [ ] Review void reasons for patterns
- [ ] Update enumerator list
- [ ] System health check

---

### User Management Audit

**Quarterly Review:**

1. List all enumerator accounts
2. Verify active vs. suspended status
3. Check for unused accounts (no responses in 30 days)
4. Review last login dates (future feature)
5. Update account statuses as needed

**Checklist:**

```
□ All active enumerators have recent activity
□ Suspended accounts are correctly marked
□ No orphaned accounts (deleted users)
□ Password policies enforced
□ Contact information up to date
```

---

### Data Backup

**Best Practices:**

1. **Frequency:** Weekly minimum, daily recommended
2. **Method:** Export all data to CSV/JSON
3. **Storage:** Secure, encrypted location
4. **Retention:** Follow institutional policy (min. 3 years)
5. **Verification:** Test restore procedure quarterly

**Backup Checklist:**

```
□ Responses exported (CSV + JSON)
□ Survey definitions exported
□ Enumerator list documented
□ Void actions logged separately
□ Backup integrity verified
```

---

## Security Best Practices

### Administrator Account Security

**Password Requirements:**
- Minimum 12 characters (stronger than enumerators)
- Mix of uppercase, lowercase, numbers, symbols
- Change every 90 days
- Never share credentials

**Multi-Factor Authentication (Future Feature):**
- Enable when available
- Use authenticator app (Google Authenticator, Authy)
- Backup recovery codes

---

### Data Privacy Compliance

**Indonesian Personal Data Protection Law (PDP Law):**

| Requirement | Implementation |
|-------------|----------------|
| **Pseudonymization** | Auto-generated respondent codes |
| **Consent Tracking** | Verbal consent before registration |
| **Data Minimization** | Only collect necessary fields |
| **Access Control** | Role-based permissions |
| **Audit Trails** | Void actions logged |
| **Data Retention** | Follow institutional policy |

**⚠️ PII Handling:**
- No names collected (pseudonyms only)
- GPS coordinates rounded for privacy
- Export data only on need-to-know basis
- Secure all exports with encryption

---

### Access Control

**Administrator Privileges:**
- ✅ Can view all responses
- ✅ Can void responses
- ✅ Can manage enumerator accounts
- ✅ Can export data
- ❌ Cannot edit submitted responses
- ❌ Cannot delete responses (void only)

**Enumerator Privileges:**
- ✅ Can register respondents
- ✅ Can fill and submit surveys
- ✅ Can view own responses
- ❌ Cannot void responses
- ❌ Cannot view other enumerators' data
- ❌ Cannot export data

---

### Incident Response

**If you suspect a security breach:**

1. **Immediately:**
   - Change your admin password
   - Suspend affected enumerator accounts
   - Document the incident

2. **Within 24 hours:**
   - Notify project supervisor
   - Review system logs
   - Export current data for backup

3. **Follow-up:**
   - Reset passwords for all users
   - Review access permissions
   - Update security procedures

**Contact Information:**
- IT Support: [To be filled]
- Data Protection Officer: [To be filled]
- Project Lead: [To be filled]

---

## Troubleshooting

### Common Issues

#### Issue 1: "Cannot suspend enumerator with active sessions"

**Cause:** Enumerator has unclosed sessions

**Solution:**
1. Contact enumerator to close all sessions
2. Or wait for sessions to auto-timeout (2 hours)
3. Then try suspending again

---

#### Issue 2: Dashboard shows no data

**Cause:** Filters too restrictive or no data collected

**Solution:**
1. Click "Clear All Filters"
2. Check date range includes data collection period
3. Verify enumerators are active and collecting data

---

#### Issue 3: Export file is empty

**Cause:** Filters exclude all responses

**Solution:**
1. Clear filters and try again
2. Check if responses exist in database
3. Verify status filter includes "submitted"

---

#### Issue 4: Void button is disabled

**Cause:** Response is draft or already voided

**Solution:**
- Drafts cannot be voided (incomplete)
- Already voided responses cannot be re-voided
- Check status column

---

## Appendix: System Configuration

### Environment Variables

**Required for deployment:**

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id

# Application Settings
NEXT_PUBLIC_APP_URL=https://your-survey-app.vercel.app
NODE_ENV=production

# Optional: Logging
NEXT_PUBLIC_LOG_LEVEL=info
```

See `.env.example` for complete documentation.

---

### Support Resources

**Documentation:**
- **Enumerator Guide:** `/docs/ENUMERATOR_GUIDE.md`
- **Appwrite Setup:** `/docs/APPWRITE_SETUP.md`
- **Development Guide:** `/docs/DEVELOPMENT.md`
- **README:** `/README.md`

**External Links:**
- Appwrite Documentation: https://appwrite.io/docs
- Next.js Documentation: https://nextjs.org/docs
- Indonesian PDP Law: [Official source]

---

**End of Administrator Guide**

**Version History:**
- v1.0 (November 2025): Initial release

**Contributors:**
- [Admin Name] - System Administrator
- [Tech Lead] - Technical Implementation

**Feedback:**
For improvements to this guide, contact: [admin@example.com]
