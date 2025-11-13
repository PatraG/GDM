# E2E Testing with Playwright

This directory contains end-to-end tests for the Geospatial Dental Modeler application using [Playwright](https://playwright.dev/).

## Test Structure

```
tests/e2e/
├── helpers.ts                      # Shared test utilities and fixtures
├── auth.spec.ts                    # Authentication flow tests
├── enumerator-workflow.spec.ts     # Enumerator workflow tests
├── multi-survey.spec.ts            # Multi-survey workflow tests
├── admin-dashboard.spec.ts         # Admin dashboard tests
├── access-control.spec.ts          # Role-based access control tests
├── network-retry.spec.ts           # Network failure and retry tests
├── session-timeout.spec.ts         # Session timeout handling tests
└── gps-permission.spec.ts          # GPS permission denial tests
```

## Prerequisites

1. **Install Playwright browsers**:
   ```bash
   npx playwright install chromium
   ```

2. **Set up test environment**:
   - Ensure you have a test Appwrite project configured
   - Create test user accounts (admin and enumerator)
   - Update `tests/e2e/helpers.ts` with correct test credentials

3. **Environment variables**:
   Create a `.env.test` file (optional) or ensure your `.env.local` has test-appropriate values:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-test-project-id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-test-database-id
   ```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test auth.spec.ts
```

### Run specific test by name
```bash
npx playwright test --grep "should login as admin"
```

### View test report
```bash
npm run test:e2e:report
```

## Test Coverage

### Authentication (auth.spec.ts)
- ✅ Login as admin
- ✅ Login as enumerator
- ✅ Invalid credentials handling
- ✅ Field validation
- ✅ Logout functionality
- ✅ Session persistence
- ✅ Protected route access

### Enumerator Workflow (enumerator-workflow.spec.ts)
- ✅ Complete respondent → session → survey → submit workflow
- ✅ Respondent creation with all fields
- ✅ Consent validation
- ✅ Respondent listing and search
- ✅ Session creation
- ✅ Active session display
- ✅ Draft survey saving
- ✅ GPS permission handling

### Multi-Survey Workflow (multi-survey.spec.ts)
- ✅ Multiple surveys for same respondent
- ✅ Survey list display
- ✅ Completed vs pending tracking
- ✅ Survey switching without losing progress
- ✅ Session maintenance across submissions
- ✅ Session summary with all surveys
- ✅ Duplicate submission prevention
- ✅ Session closure

### Admin Dashboard (admin-dashboard.spec.ts)
- ✅ Dashboard statistics display
- ✅ Submissions table
- ✅ Enumerator list
- ✅ Create enumerator account
- ✅ Email validation
- ✅ Password strength enforcement
- ✅ Enumerator status updates
- ✅ Enumerator details and statistics
- ✅ Submission filtering (status, date, pseudonym)
- ✅ Pagination
- ✅ Data export
- ✅ Access control (enumerator blocked from admin routes)

### Role-Based Access Control (access-control.spec.ts)
- ✅ Enumerators blocked from admin routes
- ✅ Admins can access all routes
- ✅ Unauthenticated users redirected to login
- ✅ Direct URL manipulation attempts blocked
- ✅ Session-based access control
- ✅ Access revocation after logout
- ✅ Role escalation prevention
- ✅ API endpoint protection
- ✅ Cross-session access control

### Network Failure & Retry (network-retry.spec.ts)
- ✅ Offline detection and recovery
- ✅ Request retry on failure
- ✅ Error display after max retries
- ✅ Form data persistence during network issues
- ✅ Survey draft preservation
- ✅ 500 server error handling
- ✅ Timeout error handling
- ✅ Malformed API response handling
- ✅ Concurrent request handling
- ✅ Loading state indicators

### Session Timeout (session-timeout.spec.ts)
- ✅ 2-hour session timeout enforcement
- ✅ Warning at 1h 45min before timeout
- ✅ Draft preservation on timeout
- ✅ Automatic logout after 2 hours
- ✅ Timeout reset on user activity
- ✅ Respondent draft preservation
- ✅ Survey draft preservation
- ✅ Active session state preservation
- ✅ Timeout warning countdown
- ✅ Session extension option
- ✅ Cross-tab session sync
- ✅ Admin vs enumerator timeout parity

### GPS Permission Denial (gps-permission.spec.ts)
- ✅ GPS permission denial handling
- ✅ Error messages for denied permission
- ✅ Retry after GPS denial
- ✅ Form submission without GPS
- ✅ GPS status indicators
- ✅ Draft saving without GPS
- ✅ Manual coordinate entry option
- ✅ Coordinate format validation
- ✅ GPS enabled/disabled indicators
- ✅ Coordinate display when available
- ✅ Permission state changes
- ✅ User preference persistence
- ✅ GPS accuracy handling
- ✅ Mid-survey GPS failure recovery
- ✅ GPS timeout handling
- ✅ Desktop browser without GPS

## Test Users

Default test users defined in `helpers.ts`:

```typescript
export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
  },
  enumerator: {
    email: 'enum1@test.com',
    password: 'Enum123!',
    role: 'enumerator',
  },
};
```

**⚠️ Important**: Create these users in your test Appwrite project before running tests.

## Helper Functions

### Authentication
- `login(page, user)` - Login with specified user credentials
- `logout(page)` - Logout current user
- `expectUnauthenticated(page)` - Assert user is on login page

### Data Creation
- `createTestRespondent(page, data?)` - Create respondent and return pseudonym
- `startSession(page, pseudonym)` - Start session for respondent
- `mockGeolocation(page, coords?)` - Grant GPS permission with mock coordinates
- `denyGeolocation(page)` - Deny GPS permission

### Assertions
- `waitForToast(page, message)` - Wait for toast notification
- `expectAccessDenied(page)` - Assert access denied (login redirect or error)

## Configuration

Playwright configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000` (or `PLAYWRIGHT_TEST_BASE_URL` env var)
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Browsers**: Chromium (default), Firefox and WebKit available
- **Reporters**: HTML report + List output
- **Web Server**: Automatically starts `npm run dev` before tests

## CI/CD Integration

Tests are designed to run in CI environments:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
    PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Failed Tests

### 1. View last run report
```bash
npm run test:e2e:report
```

### 2. Run in UI mode to interactively debug
```bash
npm run test:e2e:ui
```

### 3. Run in headed mode to see browser
```bash
npm run test:e2e:headed
```

### 4. Run with Playwright Inspector
```bash
npm run test:e2e:debug
```

### 5. Check screenshots and videos
Failed tests automatically capture:
- Screenshots (in `test-results/`)
- Videos (in `test-results/`)
- Traces (in `test-results/`)

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Cleanup**: Tests should not leave persistent data (or clean up after)
3. **Selectors**: Prefer data-testid attributes over text/CSS selectors
4. **Waits**: Use `waitFor*` methods instead of hard timeouts
5. **Assertions**: Use Playwright's built-in expect assertions
6. **Mock Data**: Use consistent test data from `helpers.ts`

## Troubleshooting

### "Error: Timed out waiting for page to load"
- Check if dev server is running
- Increase timeout in playwright.config.ts
- Verify NEXT_PUBLIC_* environment variables are set

### "Error: Locator not found"
- Update selectors to match current UI
- Add data-testid attributes to components
- Check if element is visible/enabled before interacting

### "Error: Test user not found"
- Create test users in Appwrite dashboard
- Verify credentials in helpers.ts match your setup
- Check APPWRITE_PROJECT_ID is correct

### "Navigation timeout"
- Ensure Next.js dev server is responsive
- Check for console errors in browser
- Increase webServer.timeout in config

## Adding New Tests

1. Create new `.spec.ts` file in `tests/e2e/`
2. Import helpers: `import { test, expect } from '@playwright/test';`
3. Use shared utilities from `helpers.ts`
4. Follow existing test patterns
5. Add documentation to this README

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)
