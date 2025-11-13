/**
 * Authentication Flow E2E Tests
 * 
 * Tests login, logout, and authentication state persistence
 * Validates role-based redirects and session management
 * 
 * @module tests/e2e/auth.spec.ts
 */

import { test, expect } from '@playwright/test';
import { login, logout, TEST_USERS, expectUnauthenticated } from './helpers';

test.describe('Authentication Flow', () => {
  
  test.describe('Login', () => {
    
    test('should display login page for unauthenticated users', async ({ page }) => {
      await page.goto('/');
      
      // Should redirect to login page
      await expect(page).toHaveURL('/login');
      
      // Should show login form
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
    
    test('should login as admin and redirect to admin dashboard', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in admin credentials
      await page.fill('input[type="email"]', TEST_USERS.admin.email);
      await page.fill('input[type="password"]', TEST_USERS.admin.password);
      
      // Submit login form
      await page.click('button[type="submit"]');
      
      // Should redirect to admin dashboard
      await expect(page).toHaveURL('/admin/dashboard', { timeout: 10000 });
      
      // Should show admin content
      await expect(page.locator('text=/admin|dashboard/i')).toBeVisible();
    });
    
    test('should login as enumerator and redirect to enumerator home', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in enumerator credentials
      await page.fill('input[type="email"]', TEST_USERS.enumerator.email);
      await page.fill('input[type="password"]', TEST_USERS.enumerator.password);
      
      // Submit login form
      await page.click('button[type="submit"]');
      
      // Should redirect to enumerator home
      await expect(page).toHaveURL('/enumerator/home', { timeout: 10000 });
      
      // Should show enumerator content
      await expect(page.locator('text=/enumerator|home|respondent/i')).toBeVisible();
    });
    
    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in invalid credentials
      await page.fill('input[type="email"]', 'invalid@test.com');
      await page.fill('input[type="password"]', 'WrongPassword123!');
      
      // Submit login form
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('text=/invalid|error|incorrect|failed/i')).toBeVisible({ timeout: 5000 });
      
      // Should remain on login page
      await expect(page).toHaveURL('/login');
    });
    
    test('should validate required fields', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit without filling fields
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      // Check for HTML5 validation or custom error messages
      await expect(emailInput).toHaveAttribute('required', '');
      await expect(passwordInput).toHaveAttribute('required', '');
    });
    
  });
  
  test.describe('Logout', () => {
    
    test('should logout admin user', async ({ page }) => {
      // Login as admin first
      await login(page, TEST_USERS.admin);
      
      // Verify logged in
      await expect(page).toHaveURL('/admin/dashboard');
      
      // Logout
      await logout(page);
      
      // Should redirect to login page
      await expectUnauthenticated(page);
    });
    
    test('should logout enumerator user', async ({ page }) => {
      // Login as enumerator first
      await login(page, TEST_USERS.enumerator);
      
      // Verify logged in
      await expect(page).toHaveURL('/enumerator/home');
      
      // Logout
      await logout(page);
      
      // Should redirect to login page
      await expectUnauthenticated(page);
    });
    
    test('should clear session after logout', async ({ page }) => {
      // Login as enumerator
      await login(page, TEST_USERS.enumerator);
      await expect(page).toHaveURL('/enumerator/home');
      
      // Logout
      await logout(page);
      
      // Try to access protected route
      await page.goto('/enumerator/home');
      
      // Should redirect to login
      await expectUnauthenticated(page);
    });
    
  });
  
  test.describe('Session Persistence', () => {
    
    test('should persist admin session across page reloads', async ({ page }) => {
      // Login as admin
      await login(page, TEST_USERS.admin);
      
      // Reload page
      await page.reload();
      
      // Should remain authenticated
      await expect(page).toHaveURL('/admin/dashboard');
    });
    
    test('should persist enumerator session across navigation', async ({ page }) => {
      // Login as enumerator
      await login(page, TEST_USERS.enumerator);
      
      // Navigate to different pages
      await page.goto('/enumerator/respondents');
      await expect(page).toHaveURL('/enumerator/respondents');
      
      await page.goto('/enumerator/sessions');
      await expect(page).toHaveURL('/enumerator/sessions');
      
      // Should remain authenticated
      await page.goto('/enumerator/home');
      await expect(page).toHaveURL('/enumerator/home');
    });
    
  });
  
  test.describe('Protected Routes', () => {
    
    test('should redirect unauthenticated users from admin routes', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Should redirect to login
      await expectUnauthenticated(page);
    });
    
    test('should redirect unauthenticated users from enumerator routes', async ({ page }) => {
      await page.goto('/enumerator/home');
      
      // Should redirect to login
      await expectUnauthenticated(page);
    });
    
  });
  
});
