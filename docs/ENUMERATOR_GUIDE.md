# Enumerator Quick-Start Guide

**Oral Health Survey - Field Data Collection System**

Version: 1.0  
Last Updated: November 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Daily Workflow](#daily-workflow)
4. [Conducting Surveys](#conducting-surveys)
5. [Managing Sessions](#managing-sessions)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Introduction

### What is this system?

The Oral Health Survey Data Collection System helps you collect survey data from respondents in the field. This guide will walk you through the step-by-step process of using the system.

### Your Role as an Enumerator

As an enumerator, you will:
- Register new respondents or find existing ones
- Start survey sessions with respondents
- Fill out health surveys on their behalf
- Ensure data accuracy and completeness
- Submit responses for review

---

## Getting Started

### 1. System Access

**Your administrator will provide:**
- Email address (your login username)
- Password (change on first login recommended)
- Application URL: `https://your-survey-app.vercel.app`

### 2. First Login

1. Open the application URL in your browser
2. Enter your **email** and **password**
3. Click **Sign In**
4. You'll be redirected to your dashboard

**✅ Success Indicator:** You should see your name and "Enumerator Dashboard" at the top of the page.

### 3. Understanding Your Dashboard

After login, you'll see four main sections:

| Section | Purpose |
|---------|---------|
| **Respondents** | Register new respondents or search existing ones |
| **Sessions** | Start and manage data collection sessions |
| **Surveys** | Fill out surveys during active sessions |
| **My Profile** | View your account information (future feature) |

---

## Daily Workflow

### Typical Day Structure

```
1. Login to System
2. Register/Search Respondent → Start Session
3. Conduct Survey(s) → Submit Responses
4. Close Session → Repeat for next respondent
5. Logout at end of day
```

### Workflow Diagram

```
┌─────────────────┐
│   LOGIN         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Register/Find Respondent   │◄──┐
└────────┬────────────────────┘   │
         │                         │
         ▼                         │
┌─────────────────┐                │
│  Start Session  │                │
└────────┬────────┘                │
         │                         │
         ▼                         │
┌─────────────────┐                │
│  Fill Survey(s) │ (Multiple)     │
└────────┬────────┘                │
         │                         │
         ▼                         │
┌─────────────────┐                │
│  Close Session  │                │
└────────┬────────┘                │
         │                         │
         └─────────────────────────┘
         │
         ▼
┌─────────────────┐
│     LOGOUT      │
└─────────────────┘
```

---

## Conducting Surveys

### Step 1: Register a New Respondent

**When:** Meeting a respondent for the first time

**Steps:**

1. Go to **Respondents** section
2. Click **Register New Respondent**
3. Fill in the form:
   - **Age** (years) - Required
   - **Sex** - Select: Male, Female, or Other
   - **Administrative Area** - Village/District
   - **Notes** - Any relevant information (optional)

4. **Allow GPS Location** when prompted (Required for privacy compliance)
   - This captures the registration location
   - Required for pseudonymization system

5. Click **Register Respondent**

**✅ Result:** System generates a unique **Respondent Code** (e.g., `R-2024-001`)

⚠️ **Important:** Write down the respondent code on your paper form!

---

### Step 2: Start a Session

**What is a session?** A session is a time-limited data collection period with one respondent.

**Steps:**

1. Go to **Sessions** section
2. Click **Start New Session**
3. Search for respondent by:
   - Respondent Code (fastest)
   - Age range + Sex + Area

4. Select the correct respondent from results
5. Click **Start Session**

**✅ Success Indicator:**
- Green banner: "Session started successfully"
- Active session card appears
- Timer shows session duration

**⏱️ Session Timeout:** Sessions automatically close after **2 hours** of inactivity. You'll receive a warning at **1 hour 45 minutes**.

---

### Step 3: Fill Out Survey

**During an active session:**

1. Go to **Surveys** section
2. You'll see a list of available surveys
3. Click **Fill Survey** on the survey you want to complete

**Survey Form Features:**

- **Required Questions:** Marked with red asterisk (*)
- **Question Types:**
  - Single choice: Select one option
  - Multiple choice: Select multiple options
  - Text: Enter short answer
  - Number: Enter numeric value

- **Progress Indicator:** Shows completion percentage

**✅ Validation:** System prevents submission if required questions are missing.

---

### Step 4: Review and Submit

**Before submitting:**

1. Review all answers for accuracy
2. Confirm GPS location is captured (automatic)
3. Click **Submit Response**

**✅ Submission Confirmation:**
- Green toast notification: "Survey submitted successfully"
- Response is saved and cannot be edited
- Survey marked as "Completed" in list

**📝 Draft Saving:**
- If you need to pause, click **Save Draft**
- Drafts are automatically saved every 30 seconds
- Resume from where you left off when you return

---

### Step 5: Multiple Surveys (Optional)

**If conducting multiple surveys in one session:**

1. After submitting first survey, you'll return to survey list
2. Select next survey and repeat
3. Session remains open for all surveys

**⚠️ Duplicate Prevention:** System prevents submitting the same survey twice in one session.

---

### Step 6: Close Session

**When finished with respondent:**

1. Go to **Sessions** section
2. Find your active session card
3. Click **Close Session**
4. Confirm closure

**✅ Result:**
- Session status changes to "Closed"
- All responses are preserved
- Session summary shows completed surveys

---

## Managing Sessions

### Finding Existing Respondents

**For follow-up visits:**

1. Go to **Respondents** section
2. Click **Search Respondents**
3. Enter search criteria:
   - Respondent Code (if known)
   - Age range
   - Sex
   - Administrative area

4. Click **Search**
5. Review results
6. Click **View Details** to see history
7. Click **Start New Session** for follow-up

**📋 Respondent History:** Shows all previous sessions and completed surveys.

---

### Session States

| State | Meaning | Actions Available |
|-------|---------|-------------------|
| **Open** | Active data collection | Fill surveys, Close session |
| **Closed** | Manually ended | View summary only |
| **Timeout** | Auto-closed after 2 hours | View summary only |

---

### GPS Location Requirements

**Why GPS?**
- Required for data quality
- Part of privacy compliance (pseudonymization)
- Helps with geographic analysis

**When is GPS captured?**
- ✅ Respondent registration
- ✅ Survey submission
- ❌ Session start (uses respondent's registration location)

**📍 GPS Accuracy:** System aims for <50 meter accuracy. Wait for GPS lock before proceeding.

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Cannot find respondent"

**Solution:**
- Try searching by age range instead of exact age
- Check if respondent code is typed correctly
- Verify spelling of administrative area
- Contact admin if respondent should exist but doesn't appear

---

#### Issue 2: "Session timeout warning"

**What it means:** You've been inactive for 1 hour 45 minutes.

**Solution:**
- Click **Extend Session** to reset timer
- Or finish and submit current survey
- System auto-closes at 2 hours to preserve data

---

#### Issue 3: "GPS location not available"

**Solution:**
1. Ensure device has GPS enabled
2. Move to an outdoor location if possible
3. Wait 30-60 seconds for GPS lock
4. Refresh the page if needed
5. Check browser permissions for location access

---

#### Issue 4: "Network error during submission"

**Solution:**
- ✅ Don't panic! Your data is safe (auto-saved as draft)
- Wait for network connection to restore
- Click **Submit** again when online
- System retries automatically 3 times

---

#### Issue 5: "Already submitted this survey"

**What it means:** You've already completed this survey in the current session.

**Solution:**
- This is by design to prevent duplicates
- Close current session and start a new one if you need to re-survey
- Contact admin if you believe this is an error

---

## Best Practices

### Data Quality

✅ **Do:**
- Verify respondent information before registering
- Read questions clearly to respondents
- Double-check answers before submitting
- Wait for GPS lock before proceeding
- Save drafts frequently for long surveys

❌ **Don't:**
- Rush through surveys
- Skip required questions
- Submit without reviewing
- Share your login credentials
- Register duplicate respondents

---

### Session Management

✅ **Do:**
- Close sessions when finished with respondent
- Start fresh sessions for each new respondent
- Check session timer periodically
- Extend session if you see timeout warning

❌ **Don't:**
- Leave sessions open overnight
- Use one session for multiple respondents
- Ignore timeout warnings

---

### Device and Network

✅ **Do:**
- Ensure device is charged
- Connect to stable Wi-Fi when available
- Enable GPS/location services
- Keep browser up to date
- Test system before going to field

❌ **Don't:**
- Use public/shared Wi-Fi for sensitive data
- Disable location permissions
- Clear browser cache during active session

---

### Privacy and Ethics

✅ **Do:**
- Explain study purpose to respondents
- Obtain verbal consent before proceeding
- Respect respondent privacy
- Secure your device when not in use
- Log out when finished

❌ **Don't:**
- Share respondent codes publicly
- Discuss respondent details with unauthorized people
- Take photos of survey responses
- Leave device unattended while logged in

---

## Quick Reference Card

### Essential Information

| Item | Details |
|------|---------|
| **Login URL** | `https://your-survey-app.vercel.app` |
| **Support Contact** | [Administrator Email] |
| **Session Timeout** | 2 hours inactivity |
| **Timeout Warning** | 1 hour 45 minutes |
| **GPS Accuracy** | <50 meters (aim) |
| **Network Retry** | 3 attempts automatic |

---

### Keyboard Shortcuts (Future Feature)

| Action | Shortcut |
|--------|----------|
| Save Draft | `Ctrl + S` (planned) |
| Submit Survey | `Ctrl + Enter` (planned) |
| Close Session | `Ctrl + Q` (planned) |

---

## Getting Help

### Need Assistance?

1. **Check this guide first** for common solutions
2. **Contact your supervisor** for field-specific questions
3. **Email administrator** for technical issues
4. **Report bugs** with screenshot if possible

### Support Information

- **Admin Email:** [To be filled by administrator]
- **Phone Support:** [To be filled by administrator]
- **Office Hours:** [To be filled by administrator]

---

## Appendix: Terminology

| Term | Definition |
|------|------------|
| **Respondent** | Person being surveyed |
| **Session** | Time-limited data collection period |
| **Enumerator** | You! The person conducting surveys |
| **Draft** | Incomplete survey response |
| **Pseudonym** | Auto-generated code (e.g., R-2024-001) |
| **GPS Coordinates** | Location data (latitude/longitude) |
| **Timeout** | Automatic session closure |

---

**End of Quick-Start Guide**

*For advanced features and administrator functions, see the Admin User Guide.*

**Version History:**
- v1.0 (November 2025): Initial release
