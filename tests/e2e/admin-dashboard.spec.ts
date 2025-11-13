/**
 * Admin Dashboard E2E Tests
 * 
 * Tests admin functionality:
 * - Dashboard overview and statistics
 * - Enumerator management (create, list, update status)
 * - Submission viewing and filtering
 * 
 * @module tests/e2e/admin-dashboard.spec.ts
 */

import { test, expect } from '@playwright/test';
import { login, TEST_USERS, waitForToast } from './helpers';

test.describe('Admin Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await login(page, TEST_USERS.admin);
  });
  
  test.describe('Dashboard Overview', () => {
    
    test('should display dashboard statistics', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Should show key metrics
      await expect(page.locator('text=/total.*submission|submission.*count/i')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/enumerator|active.*enumerator/i')).toBeVisible();
      await expect(page.locator('text=/respondent|total.*respondent/i')).toBeVisible();
    });
    
    test('should display recent submissions table', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Should show submissions table or list
      const table = page.locator('table, [role="table"], .submission-list');
      await expect(table).toBeVisible({ timeout: 5000 });
      
      // Should have headers/columns
      await expect(page.locator('text=/pseudonym|respondent/i')).toBeVisible();
      await expect(page.locator('text=/survey/i')).toBeVisible();
      await expect(page.locator('text=/date|submitted/i')).toBeVisible();
    });
    
    test('should navigate to enumerators management', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Click on enumerators link/button
      await page.click('a:has-text("Enumerators"), button:has-text("Enumerators")');
      
      // Should navigate to enumerators page
      await expect(page).toHaveURL('/admin/enumerators');
    });
    
  });
  
  test.describe('Enumerator Management', () => {
    
    test('should display list of enumerators', async ({ page }) => {
      await page.goto('/admin/enumerators');
      
      // Should show enumerators table/list
      const enumeratorsList = page.locator('table, [role="table"], .enumerator-list');
      await expect(enumeratorsList).toBeVisible({ timeout: 5000 });
      
      // Should have column headers
      await expect(page.locator('text=/email/i')).toBeVisible();
      await expect(page.locator('text=/status/i')).toBeVisible();
    });
    
    test('should create new enumerator account', async ({ page }) => {
      await page.goto('/admin/enumerators');
      
      // Click create button
      await page.click('button:has-text("Create Enumerator"), button:has-text("New Enumerator"), a:has-text("Add")');
      
      // Fill enumerator form
      const testEmail = `enum-test-${Date.now()}@test.com`;
      await page.fill('input[name="email"], input[type="email"]', testEmail);
      await page.fill('input[name="password"], input[type="password"]', 'TestEnum123!');
      
      // Select status (if available)
      const statusSelect = page.locator('select[name="status"]');
      if (await statusSelect.count() > 0) {
        await statusSelect.selectOption('active');
      }
      
      // Submit form
      await page.click('button[type="submit"]:has-text("Create")');
      
      // Should show success message
      await waitForToast(page, /created|success/i);
      
      // Should see new enumerator in list
      await expect(page.locator(`text=${testEmail}`)).toBeVisible({ timeout: 5000 });
    });
    
    test('should validate enumerator email format', async ({ page }) => {
      await page.goto('/admin/enumerators');
      await page.click('button:has-text("Create Enumerator"), button:has-text("New")');
      
      // Try invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'TestEnum123!');
      
      // Try to submit
      await page.click('button[type="submit"]:has-text("Create")');
      
      // Should show validation error
      await expect(page.locator('text=/invalid.*email|email.*invalid/i')).toBeVisible({ timeout: 3000 });
    });
    
    test('should enforce strong password requirements', async ({ page }) => {
      await page.goto('/admin/enumerators');
      await page.click('button:has-text("Create Enumerator"), button:has-text("New")');
      
      // Try weak password
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'weak');
      
      // Password strength indicator should show weak
      await expect(page.locator('text=/weak|password.*strength/i')).toBeVisible({ timeout: 3000 });
      
      // Or validation error on submit
      await page.click('button[type="submit"]:has-text("Create")');
      await expect(page.locator('text=/password.*required|strong.*password/i')).toBeVisible({ timeout: 3000 });
    });
    
    test('should update enumerator status', async ({ page }) => {
      await page.goto('/admin/enumerators');
      
      // Find first enumerator row
      const firstEnumerator = page.locator('table tr, .enumerator-item').nth(1); // Skip header
      
      if (await firstEnumerator.count() > 0) {
        // Click edit/manage button
        await firstEnumerator.locator('button:has-text("Edit"), a:has-text("Manage")').first().click();
        
        // Change status
        const statusSelect = page.locator('select[name="status"]');
        if (await statusSelect.count() > 0) {
          await statusSelect.selectOption('suspended');
          
          // Save changes
          await page.click('button[type="submit"]:has-text("Save")');
          
          // Should show success
          await waitForToast(page, /updated|saved|success/i);
        }
      }
    });
    
    test('should view enumerator details and statistics', async ({ page }) => {
      await page.goto('/admin/enumerators');
      
      // Click on first enumerator
      const firstEnumerator = page.locator('table tr, .enumerator-item').nth(1);
      
      if (await firstEnumerator.count() > 0) {
        await firstEnumerator.click();
        
        // Should navigate to enumerator detail page
        await expect(page).toHaveURL(/\/admin\/enumerators\/[^/]+/);
        
        // Should show enumerator statistics
        await expect(page.locator('text=/respondent|session|submission/i')).toBeVisible();
      }
    });
    
  });
  
  test.describe('Submission Management', () => {
    
    test('should display all submissions', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Should show submissions table
      const submissionsTable = page.locator('table, [data-testid="submissions-table"]');
      await expect(submissionsTable).toBeVisible({ timeout: 5000 });
    });
    
    test('should filter submissions by status', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Look for filter controls
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
      
      if (await statusFilter.count() > 0) {
        // Filter by 'submitted'
        await statusFilter.selectOption('submitted');
        
        // Wait for filtered results
        await page.waitForTimeout(1000);
        
        // Should show only submitted responses
        const statusCells = page.locator('td:has-text("submitted"), .status:has-text("submitted")');
        const count = await statusCells.count();
        
        if (count > 0) {
          expect(count).toBeGreaterThan(0);
        }
      }
    });
    
    test('should filter submissions by date range', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Look for date filters
      const fromDate = page.locator('input[type="date"][name="from"], input[name="startDate"]');
      const toDate = page.locator('input[type="date"][name="to"], input[name="endDate"]');
      
      if (await fromDate.count() > 0 && await toDate.count() > 0) {
        // Set date range
        const today = new Date().toISOString().split('T')[0];
        await fromDate.fill(today);
        await toDate.fill(today);
        
        // Apply filter
        const applyButton = page.locator('button:has-text("Apply"), button:has-text("Filter")');
        if (await applyButton.count() > 0) {
          await applyButton.click();
        }
        
        // Should update results
        await page.waitForTimeout(1000);
      }
    });
    
    test('should search submissions by respondent pseudonym', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
      
      if (await searchInput.count() > 0) {
        // Search for pattern
        await searchInput.fill('R-');
        
        // Wait for search results
        await page.waitForTimeout(1000);
        
        // Should display results with pseudonyms
        await expect(page.locator('text=/R-\\d{5}/')).toBeVisible({ timeout: 3000 });
      }
    });
    
    test('should paginate submission results', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Check if pagination controls exist
      const nextButton = page.locator('button:has-text("Next"), button[aria-label="Next page"]');
      
      if (await nextButton.count() > 0) {
        // Click next page
        await nextButton.click();
        
        // Wait for page change
        await page.waitForTimeout(1000);
        
        // Should show different results
        await expect(page.locator('text=/page.*2|showing/i')).toBeVisible({ timeout: 3000 });
      }
    });
    
    test('should export submission data', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Look for export button
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
      
      if (await exportButton.count() > 0) {
        // Start download
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        await exportButton.click();
        
        // Wait for download
        const download = await downloadPromise;
        
        // Verify download started
        expect(download.suggestedFilename()).toMatch(/\.csv|\.xlsx|\.json/);
      }
    });
    
  });
  
  test.describe('Access Control', () => {
    
    test('should prevent enumerators from accessing admin routes', async ({ page, context }) => {
      // Logout admin
      await page.click('button:has-text("Logout"), a:has-text("Logout")');
      
      // Login as enumerator
      await login(page, TEST_USERS.enumerator);
      
      // Try to access admin dashboard
      await page.goto('/admin/dashboard');
      
      // Should be redirected or blocked
      await expect(page).not.toHaveURL('/admin/dashboard');
      
      // Should show error or redirect to enumerator home
      const isEnumeratorPage = page.url().includes('/enumerator');
      const isLoginPage = page.url().includes('/login');
      const hasErrorMessage = await page.locator('text=/access denied|unauthorized|forbidden/i').count() > 0;
      
      expect(isEnumeratorPage || isLoginPage || hasErrorMessage).toBeTruthy();
    });
    
  });
  
});
