/**
 * T147: Role-Based Access Control Tests
 * 
 * Tests that verify proper role-based access control across the application:
 * - Enumerators blocked from admin routes
 * - Admins can access all routes
 * - Unauthenticated users redirected to login
 * - Direct URL manipulation attempts blocked
 */

import { test, expect } from '@playwright/test';
import { login, logout, TEST_USERS, expectAccessDenied } from './helpers';

test.describe('Role-Based Access Control', () => {
  test.describe('Enumerator Access Restrictions', () => {
    test('should block enumerators from /admin/dashboard', async ({ page }) => {
      // Login as enumerator
      await login(page, TEST_USERS.enumerator);
      
      // Try to access admin dashboard
      await page.goto('/admin/dashboard');
      
      // Should be denied access (redirect to login or show error)
      await expectAccessDenied(page);
    });

    test('should block enumerators from /admin/enumerators', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Try to access enumerator management page
      await page.goto('/admin/enumerators');
      
      await expectAccessDenied(page);
    });

    test('should block enumerators from /admin/enumerators/[id]', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Try to access specific enumerator details
      await page.goto('/admin/enumerators/test-id-123');
      
      await expectAccessDenied(page);
    });

    test('should block enumerators from admin API routes', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Try to call admin API endpoint
      const response = await page.request.get('/api/enumerators');
      
      // Should return 403 Forbidden or 401 Unauthorized
      expect([401, 403]).toContain(response.status());
    });

    test('should allow enumerators to access their own routes', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Should successfully access enumerator dashboard
      await page.goto('/enumerator/home');
      await expect(page).toHaveURL('/enumerator/home');
      
      // Should see enumerator-specific content
      await expect(page.locator('h1, h2').filter({ hasText: /enumerator|home/i })).toBeVisible();
    });
  });

  test.describe('Admin Access Permissions', () => {
    test('should allow admins to access /admin/dashboard', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL('/admin/dashboard');
      
      // Should see admin dashboard content
      await expect(page.locator('h1, h2').filter({ hasText: /dashboard|admin/i })).toBeVisible();
    });

    test('should allow admins to access /admin/enumerators', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      
      await page.goto('/admin/enumerators');
      await expect(page).toHaveURL('/admin/enumerators');
      
      // Should see enumerator management page
      await expect(page.locator('h1, h2').filter({ hasText: /enumerator/i })).toBeVisible();
    });

    test('should allow admins to access enumerator routes (for oversight)', async ({ page }) => {
      await login(page, TEST_USERS.admin);
      
      // Admins may need to access enumerator routes for testing/oversight
      await page.goto('/enumerator/home');
      
      // Should either be allowed or gracefully handled (not a hard block)
      const url = page.url();
      const isOnEnumeratorPage = url.includes('/enumerator/home');
      const isRedirected = url.includes('/admin');
      
      // Either scenario is acceptable for admins
      expect(isOnEnumeratorPage || isRedirected).toBeTruthy();
    });
  });

  test.describe('Unauthenticated Access', () => {
    test('should redirect unauthenticated users from /admin/dashboard', async ({ page }) => {
      // Don't login, just try to access protected route
      await page.goto('/admin/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should redirect unauthenticated users from /enumerator/home', async ({ page }) => {
      await page.goto('/enumerator/home');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should redirect unauthenticated users from /enumerator/respondents', async ({ page }) => {
      await page.goto('/enumerator/respondents');
      
      await expect(page).toHaveURL('/login');
    });

    test('should redirect unauthenticated users from /enumerator/sessions', async ({ page }) => {
      await page.goto('/enumerator/sessions');
      
      await expect(page).toHaveURL('/login');
    });

    test('should allow access to /login for unauthenticated users', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page).toHaveURL('/login');
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Direct URL Manipulation', () => {
    test('should block enumerator trying to bypass via direct URL', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Try multiple direct URL access attempts
      const adminRoutes = [
        '/admin/dashboard',
        '/admin/enumerators',
        '/admin/enumerators/create',
      ];
      
      for (const route of adminRoutes) {
        await page.goto(route);
        await expectAccessDenied(page);
      }
    });

    test('should maintain access control after page refresh', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Navigate to admin route
      await page.goto('/admin/dashboard');
      await expectAccessDenied(page);
      
      // Refresh the page
      await page.reload();
      
      // Should still be denied
      await expectAccessDenied(page);
    });

    test('should maintain access control after browser back button', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Start on enumerator page
      await page.goto('/enumerator/home');
      await expect(page).toHaveURL('/enumerator/home');
      
      // Try to navigate to admin page
      await page.goto('/admin/dashboard');
      await expectAccessDenied(page);
      
      // Use browser back button
      await page.goBack();
      
      // Should be back on enumerator page, not admin
      await expect(page).toHaveURL('/enumerator/home');
    });
  });

  test.describe('Session-Based Access Control', () => {
    test('should revoke access after logout', async ({ page }) => {
      // Login as enumerator
      await login(page, TEST_USERS.enumerator);
      
      // Verify access to enumerator route
      await page.goto('/enumerator/home');
      await expect(page).toHaveURL('/enumerator/home');
      
      // Logout
      await logout(page);
      
      // Try to access enumerator route again
      await page.goto('/enumerator/home');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should enforce access control across multiple sessions', async ({ page }) => {
      // Login as enumerator
      await login(page, TEST_USERS.enumerator);
      
      // Try admin route - should be denied
      await page.goto('/admin/dashboard');
      await expectAccessDenied(page);
      
      // Logout
      await logout(page);
      
      // Login as admin
      await login(page, TEST_USERS.admin);
      
      // Now admin route should work
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL('/admin/dashboard');
    });

    test('should not allow role escalation via session manipulation', async ({ page }) => {
      // Login as enumerator
      await login(page, TEST_USERS.enumerator);
      
      // Store the session
      const cookies = await page.context().cookies();
      
      // Try to access admin route
      await page.goto('/admin/dashboard');
      await expectAccessDenied(page);
      
      // Restore cookies (simulate session manipulation attempt)
      await page.context().addCookies(cookies);
      
      // Try admin route again - should still be denied
      await page.goto('/admin/dashboard');
      await expectAccessDenied(page);
    });
  });

  test.describe('API Endpoint Protection', () => {
    test('should protect admin API endpoints from enumerators', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Try to access admin API endpoints
      const adminEndpoints = [
        '/api/enumerators',
        '/api/enumerators/create',
      ];
      
      for (const endpoint of adminEndpoints) {
        const response = await page.request.get(endpoint);
        expect([401, 403, 404]).toContain(response.status());
      }
    });

    test('should protect API endpoints from unauthenticated requests', async ({ page }) => {
      // Don't login
      
      // Try to access protected API endpoints
      const protectedEndpoints = [
        '/api/enumerators',
      ];
      
      for (const endpoint of protectedEndpoints) {
        const response = await page.request.get(endpoint);
        expect([401, 403]).toContain(response.status());
      }
    });
  });
});
