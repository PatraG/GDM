# Troubleshooting FAQ

This guide provides solutions to common issues encountered when using the Oral Health Survey Data Collection System.

**Last Updated**: November 13, 2025  
**Version**: 1.0

---

## Table of Contents

- [Authentication Issues](#authentication-issues)
- [Survey Submission Problems](#survey-submission-problems)
- [GPS Location Issues](#gps-location-issues)
- [Session Management](#session-management)
- [Performance Issues](#performance-issues)
- [Network & Connectivity](#network--connectivity)
- [Browser Compatibility](#browser-compatibility)
- [Data & Permissions](#data--permissions)
- [Development & Setup](#development--setup)

---

## Authentication Issues

### Cannot Login - "Invalid Credentials" Error

**Symptoms**: Login form shows "Invalid credentials" error even with correct password.

**Possible Causes**:
1. Incorrect email or password
2. Account not created yet
3. Account suspended by admin
4. Network connectivity issue

**Solutions**:

1. **Verify credentials**:
   - Email addresses are case-sensitive in some systems
   - Check for extra spaces before/after email
   - Ensure Caps Lock is off when typing password

2. **Check account status** (Admin only):
   - Login as admin
   - Navigate to Admin → Enumerators
   - Search for the enumerator's email
   - Verify status is "Active" (not "Suspended")

3. **Account creation**:
   - Only admins can create enumerator accounts
   - Contact your system administrator if you don't have an account
   - Provide your full name and email address

4. **Reset password** (Admin only):
   - Currently requires admin to create a new account
   - Future versions will include self-service password reset

5. **Check network connection**:
   - Look for "Offline" indicator at top of screen
   - Try refreshing the page
   - Check your internet connection

---

### Session Expired - Logged Out Automatically

**Symptoms**: Redirected to login page unexpectedly, "Session expired" message.

**Possible Causes**:
- 2-hour inactivity timeout (security feature)
- Logged in on another device with same account
- Appwrite session invalidated
- Browser cleared cookies

**Solutions**:

1. **Login again**:
   - Your work is automatically saved as drafts
   - After logging in, go to Sessions page to resume

2. **Prevent auto-logout**:
   - Interact with the application every 1-2 hours
   - Keep browser tab active during field work
   - Create sessions before going to field

3. **Multiple devices**:
   - Avoid logging in on multiple devices simultaneously
   - Logout from old device before logging in on new one

4. **Browser settings**:
   - Don't use "Private/Incognito" mode
   - Allow cookies from the application domain
   - Don't clear browser data while logged in

---

### Cannot Access Admin Dashboard as Enumerator

**Symptoms**: Redirected to enumerator home page when accessing `/admin` routes.

**Expected Behavior**: This is correct - enumerators cannot access admin pages.

**Solutions**:

- Only users with "admin" role can access admin dashboard
- Enumerators have role "enumerator" with limited access
- Contact system administrator if you need admin access
- See [Admin Guide](./ADMIN_GUIDE.md) for admin-specific features

---

## Survey Submission Problems

### "Failed to Submit Survey" Error

**Symptoms**: Survey submission fails with error message after filling out form.

**Possible Causes**:
1. Network connectivity lost
2. GPS location not acquired
3. Missing required fields
4. Session expired or closed
5. Appwrite database unavailable

**Solutions**:

1. **Check network status**:
   - Look for "Offline" banner at top of screen
   - Wait for connection to restore
   - Don't close browser tab - response saved as draft

2. **Verify GPS location**:
   - Ensure browser has location permission
   - Wait for GPS coordinates to load (shows on submission page)
   - If outdoors, GPS may take 30-60 seconds
   - See [GPS Location Issues](#gps-location-issues)

3. **Check required fields**:
   - Red asterisk (*) indicates required questions
   - Scroll through entire form to find missing answers
   - Error messages appear above Submit button

4. **Verify active session**:
   - Go to Sessions page
   - Ensure session status is "Active" (green badge)
   - If "Closed", create a new session first

5. **Retry submission**:
   - Wait 10-30 seconds for network recovery
   - Click Submit button again
   - Response is saved as draft if submission fails

6. **Manual retry**:
   - Go to Sessions page
   - Click on the active session
   - Find draft response in "Draft Responses" section
   - Click "Resume" to edit and resubmit

---

### Response Saved as Draft Instead of Submitted

**Symptoms**: After clicking Submit, response appears in "Draft Responses" instead of "Submitted Responses".

**Possible Causes**:
- Network interruption during submission
- Submission failed validation
- GPS location not captured
- Browser closed before submission completed

**Solutions**:

1. **Resume and resubmit**:
   - Go to Sessions → [Your Session]
   - Find draft in "Draft Responses" section
   - Click "Resume Draft"
   - Verify all required fields filled
   - Ensure GPS location shown
   - Click Submit again

2. **Check submission requirements**:
   - All required questions answered (marked with *)
   - GPS location acquired (coordinates shown)
   - Network connection active (no "Offline" banner)
   - Session still active (not closed)

3. **If repeatedly fails**:
   - Take screenshot of error message
   - Note respondent pseudonym and timestamp
   - Contact system administrator
   - Provide error details for investigation

---

### Cannot Void a Response

**Symptoms**: "Void Response" button doesn't work or shows error.

**Possible Causes**:
- Response already voided
- Network connectivity issue
- Insufficient permissions
- Response not yet submitted (still draft)

**Solutions**:

1. **Check response status**:
   - Only "Submitted" responses can be voided
   - Draft responses can be deleted (not voided)
   - Already voided responses show "Voided" badge

2. **Verify void reason**:
   - Void reason is required (mandatory field)
   - Enter clear explanation (e.g., "Duplicate entry", "Data entry error")
   - Minimum 10 characters required

3. **Network check**:
   - Ensure online connection
   - Retry after network restored

4. **Permission check**:
   - Only the enumerator who submitted can void their own responses
   - Admins can void any response
   - Contact admin if you need to void someone else's response

---

## GPS Location Issues

### "Location Permission Denied" Error

**Symptoms**: Cannot submit survey, error message about location permission.

**Possible Causes**:
- Browser location permission not granted
- Device GPS disabled
- Location services blocked by organization

**Solutions**:

1. **Grant browser permission**:
   - **Chrome**: Click lock icon in address bar → Site settings → Location → Allow
   - **Firefox**: Click info icon in address bar → Permissions → Location → Allow
   - **Safari**: Safari menu → Settings for This Website → Location → Allow
   - **Edge**: Click lock icon → Permissions for this site → Location → Allow

2. **Enable device GPS**:
   - **Windows**: Settings → Privacy → Location → On
   - **macOS**: System Preferences → Security & Privacy → Privacy → Location Services → Enable
   - **Android**: Settings → Location → On
   - **iOS**: Settings → Privacy → Location Services → On

3. **Organization policies**:
   - Some corporate networks block GPS
   - Use personal device or mobile hotspot
   - Contact IT department if GPS blocked

4. **Refresh and retry**:
   - Refresh the browser page (F5 or Cmd+R)
   - Look for permission prompt at top of browser
   - Click "Allow" when prompted

---

### GPS Coordinates Not Accurate

**Symptoms**: GPS location shows wrong coordinates or very imprecise.

**Possible Causes**:
- Indoor location (GPS weak indoors)
- Poor GPS signal
- WiFi-based location (less accurate)
- VPN interfering with location

**Solutions**:

1. **Improve GPS accuracy**:
   - Go outdoors or near window
   - Wait 30-60 seconds for GPS to acquire satellites
   - Ensure clear view of sky
   - Avoid tall buildings or dense forests

2. **Device-specific**:
   - **Desktop/Laptop**: Uses WiFi triangulation (less accurate ±50-500m)
   - **Mobile devices**: Use actual GPS chip (accurate ±5-20m)
   - **Recommendation**: Use mobile device for field data collection

3. **Check GPS status**:
   - Coordinates shown on submission page
   - Latitude and Longitude displayed before submit
   - If blank, GPS not acquired yet - wait longer

4. **Accept limitation**:
   - System design: GPS at submission level (not individual respondent)
   - Precision: ~6 decimal places (±11cm accuracy)
   - Privacy compliant: Doesn't reveal exact house location

---

### GPS Taking Too Long to Load

**Symptoms**: "Acquiring location..." message persists for several minutes.

**Solutions**:

1. **Normal wait time**:
   - First acquisition: 30-90 seconds typical
   - Subsequent: 5-15 seconds
   - Be patient - don't refresh page

2. **Troubleshooting**:
   - Move outdoors
   - Disable VPN temporarily
   - Try different browser
   - Restart device GPS service
   - Use mobile device instead of laptop

3. **Workaround**:
   - Complete survey form while GPS acquires
   - GPS loads in background
   - By time you finish form, GPS usually ready

---

## Session Management

### Cannot Create New Session - "Active Session Exists" Error

**Symptoms**: "Create Session" button shows error, says active session already exists.

**Expected Behavior**: Only one active session allowed per enumerator at a time.

**Solutions**:

1. **Close existing session**:
   - Go to Sessions page
   - Find session with "Active" badge (green)
   - Click "Close Session" button
   - Confirm closure

2. **Verify session status**:
   - Active session may be from previous day
   - System doesn't auto-close sessions
   - Always manually close when done

3. **If session stuck**:
   - Refresh page
   - Check session list again
   - Contact admin if issue persists

---

### Session Auto-Closed Due to Inactivity

**Symptoms**: Session shows "Closed" status, notification about 2-hour timeout.

**Expected Behavior**: Security feature - sessions auto-close after 2 hours of inactivity.

**Solutions**:

1. **Resume work**:
   - Draft responses preserved when session closes
   - Create new session
   - Go to previous session page
   - Resume draft responses from "Draft Responses" section

2. **Prevent auto-close**:
   - Interact with application every 1-2 hours
   - Create draft responses periodically (saves progress)
   - Plan field work in <2 hour blocks

3. **Best practice**:
   - Start session at beginning of field work
   - Close session at end of day
   - Don't leave sessions open overnight

---

### Lost Draft Responses After Closing Session

**Symptoms**: Draft responses disappeared after closing session.

**This Should Not Happen**: Drafts are preserved even after session closes.

**Solutions**:

1. **Check closed session**:
   - Go to Sessions page
   - Click on the closed session
   - Scroll to "Draft Responses" section
   - Drafts should appear there

2. **Search by respondent**:
   - Go to Respondents page
   - Search for respondent pseudonym
   - Click on respondent
   - Check "Sessions" tab for draft

3. **If truly lost**:
   - This indicates a bug
   - Contact system administrator immediately
   - Provide: session ID, respondent pseudonym, timestamp
   - May need to re-collect data (rare)

---

## Performance Issues

### Application Slow or Laggy

**Symptoms**: Pages load slowly, forms lag when typing, buttons slow to respond.

**Possible Causes**:
- Slow internet connection
- Too many browser tabs open
- Old device/browser
- Appwrite server latency
- Large dataset loading

**Solutions**:

1. **Network optimization**:
   - Close unnecessary browser tabs
   - Disconnect other devices from WiFi
   - Use wired connection if available
   - Check internet speed (need >1 Mbps)

2. **Browser optimization**:
   - Close other applications
   - Clear browser cache: Settings → Privacy → Clear browsing data
   - Restart browser
   - Update to latest browser version

3. **Device optimization**:
   - Close background applications
   - Restart device
   - Ensure sufficient storage space (>1GB free)
   - Check CPU/RAM usage (Task Manager / Activity Monitor)

4. **Application-specific**:
   - **Slow dashboard**: Large submission lists - use date filters
   - **Slow respondent search**: Be more specific in search query
   - **Slow survey form**: Normal for 50+ questions - wait for initial load

---

### Dashboard Not Loading / Blank Screen

**Symptoms**: Dashboard page is blank or shows loading spinner indefinitely.

**Possible Causes**:
- Network timeout
- Appwrite database connection issue
- Browser JavaScript error
- Very large dataset

**Solutions**:

1. **Basic troubleshooting**:
   - Refresh page (F5 or Cmd+R)
   - Check network connection
   - Look for error message in red banner

2. **Browser console** (for tech-savvy users):
   - Press F12 (or Cmd+Option+I on Mac)
   - Click "Console" tab
   - Look for red error messages
   - Take screenshot and send to admin

3. **Try different page**:
   - Go to Home or Respondents page
   - If works, dashboard-specific issue
   - Report to system administrator

4. **Admin-specific** (if admin dashboard fails):
   - Very large submission count may cause timeout
   - Use date range filters to reduce data
   - Export data in batches instead of viewing all

---

## Network & Connectivity

### "You are currently offline" Banner Won't Disappear

**Symptoms**: Red "Offline" banner persists at top of screen even when connected.

**Possible Causes**:
- Intermittent network connection
- Browser not detecting connection change
- DNS resolution issue

**Solutions**:

1. **Verify connection**:
   - Open new tab and visit a website (e.g., google.com)
   - Check WiFi icon in system tray
   - Try ping command in terminal: `ping 8.8.8.8`

2. **Browser refresh**:
   - Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - Close and reopen browser
   - Clear browser cache

3. **Network reconnect**:
   - Disconnect and reconnect WiFi
   - Toggle airplane mode on/off (mobile)
   - Restart router/modem

4. **If persists**:
   - Banner is informational, not functional block
   - Try submitting anyway - may work despite banner
   - Report issue if functionality actually broken

---

### Submissions Failing Due to Network Timeout

**Symptoms**: Submission fails with "Network timeout" or "Request failed" error.

**Possible Causes**:
- Slow internet connection (<500 kbps)
- High server latency
- Firewall blocking Appwrite
- Intermittent connectivity

**Solutions**:

1. **Network diagnostics**:
   - Test speed: visit speedtest.net
   - Ensure >1 Mbps download, >500 kbps upload
   - Check latency to Singapore (Appwrite server location)

2. **Retry mechanism**:
   - System automatically saves as draft on failure
   - Wait 30-60 seconds
   - Try submitting again from Sessions → Draft Responses

3. **Connection improvement**:
   - Move closer to WiFi router
   - Use mobile hotspot instead of public WiFi
   - Try during off-peak hours (less congestion)
   - Disable VPN if using one

4. **Firewall check** (organization networks):
   - Appwrite endpoint: `https://sgp.cloud.appwrite.io`
   - Ensure not blocked by corporate firewall
   - Contact IT to whitelist domain

---

## Browser Compatibility

### Application Not Working in Internet Explorer

**Symptom**: Page doesn't load or displays errors in Internet Explorer.

**Solution**: Internet Explorer is not supported. Use modern browsers:
- ✅ Google Chrome (recommended)
- ✅ Microsoft Edge
- ✅ Mozilla Firefox
- ✅ Safari (macOS/iOS)

**Action**: Download and install Chrome or Edge.

---

### Features Not Working in Old Browser Version

**Symptoms**: Some buttons don't work, forms behave strangely, GPS doesn't work.

**Possible Cause**: Outdated browser version.

**Solutions**:

1. **Update browser**:
   - **Chrome**: Settings → About Chrome → Auto-update
   - **Firefox**: Menu → Help → About Firefox → Auto-update
   - **Safari**: macOS System Update
   - **Edge**: Settings → About Microsoft Edge → Auto-update

2. **Minimum versions**:
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

3. **Check version**:
   - Type `chrome://version` in Chrome address bar
   - Similar for other browsers: `about:version`, `firefox://version`

---

## Data & Permissions

### Cannot See Other Enumerators' Data

**Symptoms**: Dashboard only shows my own submissions, not others'.

**Expected Behavior**: Depends on your role.

**Enumerators**:
- ✅ Can see: Own respondents, sessions, submissions
- ❌ Cannot see: Other enumerators' data
- This is by design for data privacy

**Admins**:
- ✅ Can see: All enumerators' data
- ✅ Can manage: Enumerator accounts
- ✅ Can export: System-wide reports

**Solution**: If you need admin access, contact system administrator.

---

### Respondent Pseudonym Already Exists

**Symptoms**: Cannot create respondent, error "Pseudonym already exists".

**Cause**: Pseudonym must be unique system-wide.

**Solutions**:

1. **Search for existing respondent**:
   - Go to Respondents page
   - Search for the pseudonym
   - If found, use existing respondent (don't create duplicate)

2. **Use different pseudonym**:
   - Add initials: e.g., "R-00123-AB"
   - Use sequential number: "R-00124"
   - Follow your organization's naming convention

3. **Admin can view all**:
   - If you're enumerator, you might not see respondent created by another enumerator
   - Contact admin to verify if respondent exists

---

## Development & Setup

### Appwrite Project Setup Failing

**Symptoms**: `npm run setup:appwrite` script fails with errors.

**Possible Causes**:
- Missing environment variables
- Invalid API key
- Appwrite project not created
- Network connection issue

**Solutions**:

1. **Verify environment variables**:
   ```bash
   # Check .env file has all required variables
   cat .env
   
   # Required variables:
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
   APPWRITE_API_KEY=<your-api-key>
   ```

2. **Verify Appwrite project**:
   - Login to Appwrite Console: https://cloud.appwrite.io
   - Check project exists
   - Verify project ID matches `.env` file

3. **Generate API key**:
   - Appwrite Console → Your Project → Settings → API Keys
   - Create new key with scopes:
     - `databases.read`, `databases.write`
     - `collections.read`, `collections.write`
     - `attributes.read`, `attributes.write`
     - `indexes.read`, `indexes.write`
   - Copy key to `.env` file (starts with `project_...`)

4. **Run setup script**:
   ```bash
   npm run setup:appwrite
   ```

5. **If still fails**:
   - Check error message for specific collection/attribute name
   - May indicate collection already exists (safe to ignore)
   - See [Appwrite Setup Guide](./APPWRITE_SETUP.md) for manual steps

---

### Build Errors During Development

**Symptoms**: `npm run dev` or `npm run build` fails with TypeScript/ESLint errors.

**Common Errors**:

1. **"Module not found"**:
   ```bash
   npm install
   # Reinstall dependencies
   ```

2. **TypeScript errors**:
   ```bash
   # Check for type mismatches
   npm run type-check
   # Fix reported errors in code
   ```

3. **ESLint errors**:
   ```bash
   # Auto-fix formatting issues
   npm run lint:fix
   ```

4. **Node version mismatch**:
   ```bash
   # Check Node version (need v18+)
   node --version
   # Install Node 18+ from nodejs.org
   ```

5. **Port already in use**:
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   # Or use different port
   PORT=3001 npm run dev
   ```

---

### Environment Variables Not Working

**Symptoms**: Application doesn't connect to Appwrite, shows "Invalid credentials" or network errors.

**Solutions**:

1. **Verify `.env` file**:
   ```bash
   # Must be in project root directory
   ls -la .env
   
   # Check contents (don't share publicly!)
   cat .env
   ```

2. **Restart dev server**:
   ```bash
   # Changes to .env require restart
   # Ctrl+C to stop
   npm run dev
   ```

3. **Check variable names**:
   - Client-side variables must start with `NEXT_PUBLIC_`
   - Example: `NEXT_PUBLIC_APPWRITE_ENDPOINT`
   - Server-only: `APPWRITE_API_KEY` (no NEXT_PUBLIC_ prefix)

4. **Verify values**:
   - No quotes needed around values
   - No spaces around `=` sign
   - No trailing slashes in URLs
   - Example:
     ```
     NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
     ```

5. **Production deployment**:
   - `.env` is not deployed to Vercel/Netlify
   - Must configure environment variables in hosting platform dashboard
   - See [Deployment Guide](./DEPLOYMENT.md)

---

## Still Having Issues?

If none of the above solutions work:

1. **Collect information**:
   - What were you trying to do?
   - What error message appeared (exact text)?
   - Screenshot of error
   - Browser and version
   - Device type (desktop/mobile)
   - When did issue start?

2. **Check browser console** (F12 → Console tab):
   - Take screenshot of any red errors
   - Include in bug report

3. **Contact support**:
   - Email: [your-support-email]
   - Include all information from step 1
   - Include system information:
     - Browser: [e.g., Chrome 120]
     - OS: [e.g., Windows 11, macOS 14, Android 13]
     - Account email: [your email]
     - Timestamp when issue occurred

4. **Temporary workarounds**:
   - Try different browser
   - Use different device (mobile vs desktop)
   - Try incognito/private mode
   - Use mobile hotspot instead of WiFi

---

## Related Documentation

- [Enumerator Guide](./ENUMERATOR_GUIDE.md) - Complete user guide for field workers
- [Admin Guide](./ADMIN_GUIDE.md) - Administrator features and account management
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment and configuration
- [Appwrite Setup](./APPWRITE_SETUP.md) - Backend infrastructure setup

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Maintained By**: Development Team
