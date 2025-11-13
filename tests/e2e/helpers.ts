/**
 * E2E Test Fixtures and Helpers
 * 
 * Shared test utilities for Playwright E2E tests
 * Provides authentication helpers, test data factories, and common page objects
 */

import { Page, expect } from '@playwright/test';

/**
 * Test user credentials
 */
export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin' as const,
  },
  enumerator: {
    email: 'enum1@test.com',
    password: 'Enum123!',
    role: 'enumerator' as const,
  },
};

/**
 * Test data for respondents
 */
export const TEST_RESPONDENT = {
  ageRange: '25-34' as const,
  sex: 'F' as const,
  adminArea: 'Test District, Test Village',
};

/**
 * Login helper - authenticates a user and navigates to dashboard
 */
export async function login(
  page: Page,
  user: typeof TEST_USERS.admin | typeof TEST_USERS.enumerator
): Promise<void> {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill in login form
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  if (user.role === 'admin') {
    await page.waitForURL('/admin/dashboard');
  } else {
    await page.waitForURL('/enumerator/home');
  }
}

/**
 * Logout helper - logs out the current user
 */
export async function logout(page: Page): Promise<void> {
  // Click logout button (usually in header/nav)
  await page.click('button:has-text("Logout"), a:has-text("Logout")');
  
  // Wait for redirect to login page
  await page.waitForURL('/login');
}

/**
 * Create a test respondent as enumerator
 */
export async function createTestRespondent(
  page: Page,
  data: typeof TEST_RESPONDENT = TEST_RESPONDENT
): Promise<string> {
  // Navigate to respondents page
  await page.goto('/enumerator/respondents');
  
  // Click create button
  await page.click('button:has-text("Create"), a:has-text("New Respondent")');
  
  // Fill in respondent form
  await page.selectOption('select[name="ageRange"]', data.ageRange);
  await page.selectOption('select[name="sex"]', data.sex);
  await page.fill('input[name="adminArea"]', data.adminArea);
  await page.check('input[type="checkbox"][name="consentGiven"]');
  
  // Submit form
  await page.click('button[type="submit"]:has-text("Create")');
  
  // Wait for success message or navigation
  await expect(page.locator('text=/created|success/i')).toBeVisible({ timeout: 5000 });
  
  // Extract pseudonym from success message or page
  const pseudonymText = await page.locator('text=/R-\\d{5}|Pseudonym/').first().textContent();
  const pseudonym = pseudonymText?.match(/R-\d{5}/)?.[0] || 'R-00001';
  
  return pseudonym;
}

/**
 * Start a session for a respondent
 */
export async function startSession(page: Page, pseudonym: string): Promise<void> {
  // Navigate to sessions page
  await page.goto('/enumerator/sessions');
  
  // Search for respondent
  await page.fill('input[placeholder*="Search"], input[type="search"]', pseudonym);
  
  // Click on respondent to start session
  await page.click(`text=${pseudonym}`);
  
  // Wait for session to be created
  await expect(page.locator('text=/session.*started|active session/i')).toBeVisible({ timeout: 5000 });
}

/**
 * Wait for toast notification with specific message
 */
export async function waitForToast(page: Page, message: string | RegExp): Promise<void> {
  await expect(page.locator(`[role="alert"], [role="status"]`).filter({ hasText: message }))
    .toBeVisible({ timeout: 5000 });
}

/**
 * Check if user is on login page (unauthenticated)
 */
export async function expectUnauthenticated(page: Page): Promise<void> {
  await expect(page).toHaveURL('/login');
}

/**
 * Check if user is blocked from accessing a route (redirected or 403/404)
 */
export async function expectAccessDenied(page: Page): Promise<void> {
  // Either redirected to login, or see error message, or 403/404
  const isLoginPage = page.url().includes('/login');
  const hasErrorMessage = await page.locator('text=/access denied|unauthorized|forbidden|not found/i').count() > 0;
  
  expect(isLoginPage || hasErrorMessage).toBeTruthy();
}

/**
 * Mock geolocation for GPS tests
 */
export async function mockGeolocation(
  page: Page,
  coords: { latitude: number; longitude: number } = { latitude: -7.250474, longitude: 112.768883 }
): Promise<void> {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: 15,
  });
}

/**
 * Deny geolocation permission
 */
export async function denyGeolocation(page: Page): Promise<void> {
  await page.context().clearPermissions();
}
