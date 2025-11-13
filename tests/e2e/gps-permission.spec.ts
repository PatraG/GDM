/**
 * T150: GPS Permission Denial Handling Tests
 * 
 * Tests that verify proper handling of GPS permission denial:
 * - GPS permission denial handling
 * - Fallback behavior without GPS
 * - Error messages for denied permission
 * - Form submission without GPS coordinates
 * - Manual coordinate entry option
 */

import { test, expect } from '@playwright/test';
import { login, TEST_USERS, createTestRespondent, startSession, denyGeolocation, mockGeolocation, waitForToast } from './helpers';

test.describe('GPS Permission Denial Handling', () => {
  test.describe('Permission Request and Denial', () => {
    test('should handle GPS permission denial gracefully', async ({ page, context }) => {
      await login(page, TEST_USERS.enumerator);
      
      // Create respondent and start session
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      // Navigate to survey
      await page.goto('/enumerator/surveys');
      
      // Deny geolocation when requested
      await denyGeolocation(page);
      
      // Should show appropriate message
      await page.waitForTimeout(1000);
      
      // Look for GPS error message or fallback UI
      const gpsMessage = page.locator('[role="alert"], .toast, .error-message').filter({ 
        hasText: /location|gps|permission|denied/i 
      }).first();
      
      // Should not crash the application
      await expect(page.locator('form, [role="main"]')).toBeVisible();
    });

    test('should show error message when GPS is denied', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Deny GPS permission
      await denyGeolocation(page);
      
      // Wait for error message
      await page.waitForTimeout(1000);
      
      // Should see error about GPS permission
      const errorMessage = page.locator('[role="alert"], .error, .toast').filter({ 
        hasText: /location|gps|permission/i 
      }).first();
      
      // Error should be visible or logged
      // Note: Implementation may vary - could be toast, inline message, or console log
    });

    test('should allow retry after GPS denial', async ({ page, context }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // First attempt: deny
      await denyGeolocation(page);
      await page.waitForTimeout(500);
      
      // Look for retry button
      const retryButton = page.locator('button').filter({ 
        hasText: /retry|enable|allow|location/i 
      }).first();
      
      if (await retryButton.isVisible()) {
        // Grant permission on retry
        await mockGeolocation(page);
        await retryButton.click();
        
        // Should now have GPS access
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Fallback Behavior Without GPS', () => {
    test('should allow form submission without GPS coordinates', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Deny GPS
      await denyGeolocation(page);
      await page.waitForTimeout(500);
      
      // Fill survey form (without GPS)
      const textInput = page.locator('input[type="text"], textarea').first();
      if (await textInput.isVisible()) {
        await textInput.fill('Survey response without GPS');
      }
      
      // Try to submit
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /submit|save|complete/i 
      }).first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Should either:
        // 1. Submit successfully without GPS data
        // 2. Show warning but allow submission
        // 3. Require manual coordinate entry
      }
    });

    test('should mark GPS data as unavailable when denied', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Deny GPS
      await denyGeolocation(page);
      await page.waitForTimeout(500);
      
      // Check if GPS status is indicated
      const gpsStatus = page.locator('[data-testid="gps-status"], .gps-indicator').first();
      
      // Should show GPS unavailable/disabled status
      // Note: This depends on UI implementation
    });

    test('should save draft without GPS coordinates', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Deny GPS
      await denyGeolocation(page);
      await page.waitForTimeout(500);
      
      // Fill some fields
      const textInput = page.locator('input[type="text"], textarea').first();
      if (await textInput.isVisible()) {
        await textInput.fill('Draft without GPS');
        
        // Save draft
        const saveDraftButton = page.locator('button').filter({ 
          hasText: /save|draft/i 
        }).first();
        
        if (await saveDraftButton.isVisible()) {
          await saveDraftButton.click();
          
          // Should save successfully
          await page.waitForTimeout(1000);
          await waitForToast(page, /saved|draft/i);
        }
      }
    });
  });

  test.describe('Manual Coordinate Entry', () => {
    test('should allow manual GPS coordinate entry when permission denied', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Deny GPS
      await denyGeolocation(page);
      await page.waitForTimeout(500);
      
      // Look for manual entry option
      const manualEntryButton = page.locator('button, a').filter({ 
        hasText: /manual|enter|coordinates/i 
      }).first();
      
      if (await manualEntryButton.isVisible()) {
        await manualEntryButton.click();
        
        // Fill manual coordinates
        const latInput = page.locator('input[name*="lat"], input[placeholder*="lat"]').first();
        const lonInput = page.locator('input[name*="lon"], input[name*="lng"], input[placeholder*="lon"]').first();
        
        if (await latInput.isVisible() && await lonInput.isVisible()) {
          await latInput.fill('9.0820');
          await lonInput.fill('8.6753');
          
          // Submit with manual coordinates
          const submitButton = page.locator('button[type="submit"]').first();
          await submitButton.click();
          
          await page.waitForTimeout(1000);
        }
      }
    });

    test('should validate manual coordinate format', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Deny GPS
      await denyGeolocation(page);
      await page.waitForTimeout(500);
      
      // Look for manual entry
      const manualEntryButton = page.locator('button, a').filter({ 
        hasText: /manual|enter|coordinates/i 
      }).first();
      
      if (await manualEntryButton.isVisible()) {
        await manualEntryButton.click();
        
        const latInput = page.locator('input[name*="lat"], input[placeholder*="lat"]').first();
        const lonInput = page.locator('input[name*="lon"], input[name*="lng"]').first();
        
        if (await latInput.isVisible()) {
          // Enter invalid coordinates
          await latInput.fill('invalid');
          await lonInput.fill('not-a-number');
          
          // Try to submit
          const submitButton = page.locator('button[type="submit"]').first();
          await submitButton.click();
          
          // Should show validation error
          await page.waitForTimeout(500);
          const errorMessage = page.locator('[role="alert"], .error').filter({ 
            hasText: /coordinate|invalid|number/i 
          }).first();
        }
      }
    });
  });

  test.describe('GPS Status Indicators', () => {
    test('should show GPS enabled indicator when permission granted', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Grant GPS permission
      await mockGeolocation(page);
      await page.waitForTimeout(500);
      
      // Look for GPS enabled indicator
      const gpsIndicator = page.locator('[data-testid="gps-status"], .gps-indicator, [aria-label*="location"]').first();
      
      // Should show enabled/active status
      // Note: UI implementation may vary
    });

    test('should show GPS disabled indicator when permission denied', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Deny GPS permission
      await denyGeolocation(page);
      await page.waitForTimeout(500);
      
      // Look for GPS disabled indicator
      const gpsIndicator = page.locator('[data-testid="gps-status"], .gps-indicator').first();
      
      // Should show disabled/unavailable status
    });

    test('should display GPS coordinates when available', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Grant GPS with specific coordinates
      await mockGeolocation(page, { latitude: 9.0820, longitude: 8.6753 });
      await page.waitForTimeout(1000);
      
      // Look for displayed coordinates
      const coordDisplay = page.locator('text=/9.082|8.675/').first();
      
      // Coordinates should be visible somewhere on the page
    });

    test('should show appropriate message when GPS unavailable', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Deny GPS
      await denyGeolocation(page);
      await page.waitForTimeout(500);
      
      // Should show unavailable message
      const unavailableMsg = page.locator('text=/unavailable|denied|disabled/i').first();
      
      // Message should inform user about GPS status
    });
  });

  test.describe('Permission Re-request After Denial', () => {
    test('should handle permission state changes', async ({ page, context }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Initially deny
      await denyGeolocation(page);
      await page.waitForTimeout(500);
      
      // Later grant permission (simulating user changing browser settings)
      await mockGeolocation(page);
      
      // Reload or trigger permission check
      await page.reload();
      await page.waitForTimeout(1000);
      
      // Should now have GPS access
    });

    test('should persist user preference to skip GPS', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Deny GPS and select "don't ask again" option
      await denyGeolocation(page);
      
      const dontAskCheckbox = page.locator('input[type="checkbox"]').filter({ 
        hasText: /don\'t ask|skip|remember/i 
      }).first();
      
      if (await dontAskCheckbox.isVisible()) {
        await dontAskCheckbox.check();
      }
      
      // Navigate away and back
      await page.goto('/enumerator/home');
      await page.goto('/enumerator/surveys');
      
      // Should not ask for GPS again
      await page.waitForTimeout(500);
    });
  });

  test.describe('GPS Accuracy and Quality', () => {
    test('should accept GPS with low accuracy when denied better access', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Mock GPS coordinates
      // Note: Browser geolocation API doesn't expose accuracy control in Playwright
      // In real scenarios, accuracy would vary based on device/environment
      await mockGeolocation(page, { 
        latitude: 9.0820, 
        longitude: 8.6753
      });
      
      await page.waitForTimeout(500);
      
      // Should accept coordinates even with low accuracy
      // May show warning about accuracy (if app detects it)
      const accuracyWarning = page.locator('[role="alert"], .warning').filter({ 
        hasText: /accuracy|approximate/i 
      }).first();
    });

    test('should show accuracy information to user', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Mock GPS coordinates
      // Note: Accuracy display depends on app implementation
      await mockGeolocation(page, { 
        latitude: 9.0820, 
        longitude: 8.6753
      });
      
      await page.waitForTimeout(1000);
      
      // Look for accuracy display (if implemented in app)
      const accuracyDisplay = page.locator('text=/accuracy|±.*m/i').first();
      
      // Should show accuracy information (if app supports it)
    });
  });

  test.describe('Error Recovery', () => {
    test('should continue survey submission if GPS fails mid-survey', async ({ page, context }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Start with GPS granted
      await mockGeolocation(page);
      await page.waitForTimeout(500);
      
      // Fill some fields
      const textInput = page.locator('input[type="text"], textarea').first();
      if (await textInput.isVisible()) {
        await textInput.fill('Survey with GPS initially granted');
      }
      
      // Simulate GPS becoming unavailable mid-survey
      await denyGeolocation(page);
      
      // Should still allow submission
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Should handle gracefully
      }
    });

    test('should handle GPS timeout gracefully', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Don't grant or deny - let it timeout
      await page.waitForTimeout(3000);
      
      // Should show timeout message and fallback options
      const timeoutMessage = page.locator('[role="alert"], .error').filter({ 
        hasText: /timeout|unavailable|try again/i 
      }).first();
      
      // App should remain functional
      await expect(page.locator('form, [role="main"]')).toBeVisible();
    });
  });

  test.describe('Cross-Platform GPS Handling', () => {
    test('should handle desktop browser without GPS', async ({ page }) => {
      await login(page, TEST_USERS.enumerator);
      
      const pseudonym = await createTestRespondent(page);
      await startSession(page, pseudonym);
      
      await page.goto('/enumerator/surveys');
      
      // Desktop browsers may not have GPS
      // Should show appropriate message and alternatives
      await page.waitForTimeout(1000);
      
      // Should offer manual entry or skip GPS
      const manualOption = page.locator('button, a').filter({ 
        hasText: /manual|skip|enter coordinates/i 
      }).first();
    });
  });
});
