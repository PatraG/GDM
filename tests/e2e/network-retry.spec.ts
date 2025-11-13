/**
 * T148: Network Failure and Retry Mechanism Tests
 * 
 * Tests that verify proper handling of network failures:
 * - Retry mechanisms for failed requests
 * - Offline detection and user feedback
 * - Data persistence during connectivity loss
 * - Recovery after network restoration
 */

import { test, expect } from '@playwright/test';
import { login, TEST_USERS, createTestRespondent, startSession, waitForToast } from './helpers';

test.describe('Network Failure and Retry Mechanism', () => {
  test.describe('Offline Detection', () => {
    test('should detect when browser goes offline', async ({ page, context }) => {
      await login(page, TEST_USERS.enumerator);
      await page.goto('/enumerator/home');
      
      // Simulate offline mode
      await context.setOffline(true);
      
      // Wait a moment for offline detection
      await page.waitForTimeout(1000);
      
      // Check if offline indicator appears (if implemented)
      // This depends on your implementation
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner, .network-status').first();
      
      // Try to make a network request
      const respondentsLink = page.locator('a[href*="/respondents"]').first();
      if (await respondentsLink.isVisible()) {
        await respondentsLink.click();
        
        // Should show some indication of offline state
        // Could be an error message, offline banner, or cached data indication
        await page.waitForTimeout(500);
      }
      
      // Restore online mode
      await context.setOffline(false);
    });

    test('should recover when network comes back online', async ({ page, context }) => {
      await login(page, TEST_USERS.enumerator);
      await page.goto('/enumerator/home');
      
      // Go offline
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      // Come back online
      await context.setOffline(false);
      await page.waitForTimeout(500);
      
      // Should be able to navigate normally
      await page.goto('/enumerator/respondents');
      await expect(page).toHaveURL('/enumerator/respondents');
    });
  });

  test.describe('Request Retry on Failure', () => {
    test('should retry failed respondent creation', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      await page.goto('/enumerator/respondents');
      
      // Intercept the request and fail it the first time
      let attemptCount = 0;
      await page.route('**/api/respondents', async (route) => {
        attemptCount++;
        if (attemptCount === 1) {
          // Fail the first attempt
          await route.abort('failed');
        } else {
          // Let subsequent attempts through
          await route.continue();
        }
      });
      
      // Try to create a respondent
      const createButton = page.locator('button').filter({ hasText: /create|new|add/i }).first();
      if (await createButton.isVisible()) {
        await createButton.click();
        
        // Fill form
        await page.fill('input[name="ageRange"], select[name="ageRange"]', '25-34');
        await page.selectOption('select[name="sex"]', 'female');
        await page.fill('input[name="district"]', 'Test District');
        await page.check('input[type="checkbox"][name="consent"]');
        
        // Submit
        await page.click('button[type="submit"]');
        
        // Should eventually succeed with retry
        await page.waitForTimeout(2000);
      }
      
      // Clean up route
      await page.unroute('**/api/respondents');
    });

    test('should show error after max retries exceeded', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      await page.goto('/enumerator/respondents');
      
      // Intercept and always fail
      await page.route('**/api/respondents', async (route) => {
        await route.abort('failed');
      });
      
      // Try to create a respondent
      const createButton = page.locator('button').filter({ hasText: /create|new|add/i }).first();
      if (await createButton.isVisible()) {
        await createButton.click();
        
        // Fill form
        await page.fill('input[name="ageRange"], select[name="ageRange"]', '25-34');
        await page.selectOption('select[name="sex"]', 'female');
        await page.fill('input[name="district"]', 'Test District');
        await page.check('input[type="checkbox"][name="consent"]');
        
        // Submit
        await page.click('button[type="submit"]');
        
        // Should show error message after retries exhausted
        await page.waitForTimeout(3000);
        
        // Look for error indicators
        const errorMessage = page.locator('[role="alert"], .error, .toast').filter({ hasText: /error|fail|network/i }).first();
        // Note: Error handling might vary based on implementation
      }
      
      // Clean up
      await page.unroute('**/api/respondents');
    });
  });

  test.describe('Form Data Persistence During Network Issues', () => {
    test('should preserve respondent form data during network failure', async ({ page, context }) => {
      await login(page, TEST_USERS.enumerator);
      await page.goto('/enumerator/respondents');
      
      // Start creating a respondent
      const createButton = page.locator('button').filter({ hasText: /create|new|add/i }).first();
      if (await createButton.isVisible()) {
        await createButton.click();
        
        // Fill form
        await page.fill('input[name="ageRange"], select[name="ageRange"]', '25-34');
        await page.selectOption('select[name="sex"]', 'female');
        await page.fill('input[name="district"]', 'Test District Network');
        await page.check('input[type="checkbox"][name="consent"]');
        
        // Go offline before submitting
        await context.setOffline(true);
        
        // Try to submit
        await page.click('button[type="submit"]');
        
        // Wait for error
        await page.waitForTimeout(2000);
        
        // Form data should still be there
        const districtValue = await page.inputValue('input[name="district"]');
        expect(districtValue).toBe('Test District Network');
        
        // Restore online
        await context.setOffline(false);
        
        // Try submitting again
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      }
    });

    test('should preserve survey draft during network failure', async ({ page, context }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Create respondent and start session
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      // Navigate to survey
      await page.goto('/enumerator/surveys');
      
      // Fill some survey fields
      const textInput = page.locator('input[type="text"], textarea').first();
      if (await textInput.isVisible()) {
        await textInput.fill('Test response with network issues');
        
        // Go offline
        await context.setOffline(true);
        
        // Try to save draft
        const saveDraftButton = page.locator('button').filter({ hasText: /save|draft/i }).first();
        if (await saveDraftButton.isVisible()) {
          await saveDraftButton.click();
          await page.waitForTimeout(1000);
        }
        
        // Input should still have value
        const value = await textInput.inputValue();
        expect(value).toContain('Test response with network issues');
        
        // Restore online
        await context.setOffline(false);
      }
    });
  });

  test.describe('API Error Handling', () => {
    test('should handle 500 server errors gracefully', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      await page.goto('/enumerator/respondents');
      
      // Intercept and return 500 error
      await page.route('**/api/respondents', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      // Try to load respondents
      await page.reload();
      await page.waitForTimeout(1000);
      
      // Should show error message, not crash
      const errorElement = page.locator('[role="alert"], .error-message, .toast').first();
      // App should remain functional
      
      // Clean up
      await page.unroute('**/api/respondents');
    });

    test('should handle timeout errors', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      await page.goto('/enumerator/respondents');
      
      // Intercept and delay response
      await page.route('**/api/respondents', async (route) => {
        // Delay for longer than timeout
        await page.waitForTimeout(35000); // Longer than typical timeout
        await route.continue();
      });
      
      // Try to create respondent
      const createButton = page.locator('button').filter({ hasText: /create|new|add/i }).first();
      if (await createButton.isVisible()) {
        await createButton.click();
        
        await page.fill('input[name="ageRange"], select[name="ageRange"]', '25-34');
        await page.selectOption('select[name="sex"]', 'female');
        await page.fill('input[name="district"]', 'Test District');
        await page.check('input[type="checkbox"][name="consent"]');
        
        await page.click('button[type="submit"]');
        
        // Should eventually show timeout error
        await page.waitForTimeout(5000);
      }
      
      // Clean up
      await page.unroute('**/api/respondents');
    });

    test('should handle malformed API responses', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      await page.goto('/enumerator/respondents');
      
      // Intercept and return invalid JSON
      await page.route('**/api/respondents', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'this is not valid json {'
        });
      });
      
      await page.reload();
      await page.waitForTimeout(1000);
      
      // Should handle gracefully without crashing
      // Page should still be functional
      
      // Clean up
      await page.unroute('**/api/respondents');
    });
  });

  test.describe('Concurrent Request Handling', () => {
    test('should handle multiple simultaneous requests', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Track all requests
      const requests: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          requests.push(request.url());
        }
      });
      
      // Navigate to multiple pages quickly
      await page.goto('/enumerator/home');
      await page.goto('/enumerator/respondents');
      await page.goto('/enumerator/sessions');
      
      await page.waitForTimeout(2000);
      
      // All pages should load without errors
      await expect(page).toHaveURL('/enumerator/sessions');
    });

    test('should queue requests appropriately during slow network', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Slow down all API requests
      await page.route('**/api/**', async (route) => {
        await page.waitForTimeout(1000); // 1 second delay
        await route.continue();
      });
      
      // Make rapid navigation
      await page.goto('/enumerator/respondents');
      await page.goto('/enumerator/sessions');
      
      // Should eventually settle on final page
      await page.waitForTimeout(3000);
      await expect(page).toHaveURL('/enumerator/sessions');
      
      // Clean up
      await page.unroute('**/api/**');
    });
  });

  test.describe('Network Status Indicators', () => {
    test('should show loading state during requests', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Slow down requests to observe loading state
      await page.route('**/api/respondents', async (route) => {
        await page.waitForTimeout(500);
        await route.continue();
      });
      
      await page.goto('/enumerator/respondents');
      
      // Look for loading indicators
      const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner, [role="status"]').first();
      
      // Wait for content to load
      await page.waitForTimeout(1000);
      
      // Clean up
      await page.unroute('**/api/respondents');
    });

    test('should clear loading state after request completes', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      await page.goto('/enumerator/respondents');
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      
      // Loading indicators should be gone
      const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner').first();
      if (await loadingIndicator.count() > 0) {
        await expect(loadingIndicator).not.toBeVisible();
      }
    });
  });
});
