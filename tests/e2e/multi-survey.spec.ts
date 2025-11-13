/**
 * Multi-Survey Workflow E2E Tests
 * 
 * Tests handling multiple surveys for the same respondent
 * Validates session continuity and survey switching
 * 
 * @module tests/e2e/multi-survey.spec.ts
 */

import { test, expect } from '@playwright/test';
import { 
  login, 
  TEST_USERS,
  createTestRespondent,
  startSession,
  mockGeolocation,
  waitForToast,
} from './helpers';

test.describe('Multi-Survey Workflow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as enumerator
    await login(page, TEST_USERS.enumerator);
    
    // Mock geolocation
    await mockGeolocation(page);
  });
  
  test('should allow multiple surveys for same respondent in one session', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Navigate to surveys
    await page.goto('/enumerator/surveys');
    
    // Get all available surveys
    const surveys = page.locator('[data-testid="survey-card"], .survey-item');
    const surveyCount = await surveys.count();
    
    // If multiple surveys available, fill and submit at least 2
    if (surveyCount >= 2) {
      for (let i = 0; i < Math.min(2, surveyCount); i++) {
        // Click on survey
        await surveys.nth(i).click();
        
        // Wait for form to load
        await expect(page.locator('form, [data-testid="survey-form"]')).toBeVisible({ timeout: 5000 });
        
        // Fill first question (if exists)
        const firstInput = page.locator('input[type="text"], textarea, select, input[type="radio"]').first();
        if (await firstInput.count() > 0) {
          const inputType = await firstInput.getAttribute('type');
          if (inputType === 'radio') {
            await firstInput.check();
          } else if (await firstInput.evaluate(el => el.tagName) === 'SELECT') {
            await firstInput.selectOption({ index: 1 });
          } else {
            await firstInput.fill(`Answer for survey ${i + 1}`);
          }
        }
        
        // Submit survey
        await page.click('button[type="submit"]:has-text("Submit")');
        
        // Wait for success
        await waitForToast(page, /submitted|success/i);
        
        // Should return to surveys list or home
        await expect(page).toHaveURL(/\/enumerator\/(surveys|home)/);
      }
      
      // Verify session shows multiple completed surveys
      await page.goto('/enumerator/sessions');
      await expect(page.locator('text=/completed|submitted/i')).toBeVisible();
    }
  });
  
  test('should display available surveys for active session', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Navigate to surveys
    await page.goto('/enumerator/surveys');
    
    // Should display survey list
    const surveys = page.locator('[data-testid="survey-card"], .survey-item');
    await expect(surveys.first()).toBeVisible({ timeout: 5000 });
    
    // Each survey should have title
    const surveyCount = await surveys.count();
    for (let i = 0; i < surveyCount; i++) {
      await expect(surveys.nth(i).locator('text=/survey|title/i')).toBeVisible();
    }
  });
  
  test('should track completed vs pending surveys', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Navigate to surveys
    await page.goto('/enumerator/surveys');
    
    // Get first survey
    const firstSurvey = page.locator('[data-testid="survey-card"], .survey-item').first();
    await firstSurvey.click();
    
    // Fill and submit
    const firstInput = page.locator('input, textarea, select').first();
    if (await firstInput.count() > 0) {
      await firstInput.fill('Completed answer');
    }
    
    await page.click('button[type="submit"]:has-text("Submit")');
    await waitForToast(page, /submitted|success/i);
    
    // Return to surveys list
    await page.goto('/enumerator/surveys');
    
    // First survey should show as completed
    await expect(page.locator('text=/completed|submitted|done/i')).toBeVisible();
  });
  
  test('should allow switching between surveys without losing progress', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Navigate to first survey
    await page.goto('/enumerator/surveys');
    const surveys = page.locator('[data-testid="survey-card"], .survey-item');
    
    if (await surveys.count() >= 2) {
      // Start first survey
      await surveys.nth(0).click();
      await expect(page.locator('form')).toBeVisible({ timeout: 5000 });
      
      // Fill partial answer
      const firstInput = page.locator('input[type="text"], textarea').first();
      if (await firstInput.count() > 0) {
        await firstInput.fill('Partial answer 1');
      }
      
      // Save draft
      const draftButton = page.locator('button:has-text("Save Draft"), button:has-text("Draft")');
      if (await draftButton.count() > 0) {
        await draftButton.click();
        await waitForToast(page, /draft.*saved/i);
      }
      
      // Navigate back to surveys
      await page.goto('/enumerator/surveys');
      
      // Start second survey
      await surveys.nth(1).click();
      await expect(page.locator('form')).toBeVisible({ timeout: 5000 });
      
      // Should be able to fill second survey independently
      const secondInput = page.locator('input[type="text"], textarea').first();
      if (await secondInput.count() > 0) {
        await secondInput.fill('Answer for survey 2');
      }
    }
  });
  
  test('should maintain session across multiple survey submissions', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Navigate to surveys
    await page.goto('/enumerator/surveys');
    
    const surveys = page.locator('[data-testid="survey-card"], .survey-item');
    const surveyCount = await surveys.count();
    
    if (surveyCount >= 1) {
      // Submit first survey
      await surveys.first().click();
      await expect(page.locator('form')).toBeVisible({ timeout: 5000 });
      
      const firstInput = page.locator('input, textarea, select').first();
      if (await firstInput.count() > 0) {
        await firstInput.fill('Test answer');
      }
      
      await page.click('button[type="submit"]:has-text("Submit")');
      await waitForToast(page, /submitted|success/i);
      
      // Session should still be active
      await page.goto('/enumerator/sessions');
      await expect(page.locator(`text=${pseudonym}`)).toBeVisible();
      await expect(page.locator('text=/active|open/i')).toBeVisible();
    }
  });
  
  test('should display session summary with all submitted surveys', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Submit at least one survey
    await page.goto('/enumerator/surveys');
    const firstSurvey = page.locator('[data-testid="survey-card"], .survey-item').first();
    await firstSurvey.click();
    
    // Fill and submit
    const firstInput = page.locator('input, textarea, select').first();
    if (await firstInput.count() > 0) {
      await firstInput.fill('Summary test answer');
    }
    
    await page.click('button[type="submit"]:has-text("Submit")');
    await waitForToast(page, /submitted|success/i);
    
    // Navigate to session details/summary
    await page.goto('/enumerator/sessions');
    
    // Should show session summary
    await expect(page.locator(`text=${pseudonym}`)).toBeVisible();
    await expect(page.locator('text=/submitted|completed/i')).toBeVisible();
  });
  
  test('should prevent submitting same survey twice for same session', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Navigate to surveys
    await page.goto('/enumerator/surveys');
    const firstSurvey = page.locator('[data-testid="survey-card"], .survey-item').first();
    
    // Get survey title/ID before clicking
    const surveyTitle = await firstSurvey.textContent();
    
    // Submit survey first time
    await firstSurvey.click();
    await expect(page.locator('form')).toBeVisible({ timeout: 5000 });
    
    const firstInput = page.locator('input, textarea, select').first();
    if (await firstInput.count() > 0) {
      await firstInput.fill('First submission');
    }
    
    await page.click('button[type="submit"]:has-text("Submit")');
    await waitForToast(page, /submitted|success/i);
    
    // Try to access same survey again
    await page.goto('/enumerator/surveys');
    
    // Survey should show as already completed or disabled
    const completedSurvey = page.locator(`text=${surveyTitle}`).or(page.locator('.survey-item').first());
    await expect(completedSurvey.locator('text=/completed|submitted/i')).toBeVisible({ timeout: 3000 });
  });
  
  test('should close session after all surveys completed', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Submit a survey
    await page.goto('/enumerator/surveys');
    const firstSurvey = page.locator('[data-testid="survey-card"], .survey-item').first();
    await firstSurvey.click();
    
    const firstInput = page.locator('input, textarea, select').first();
    if (await firstInput.count() > 0) {
      await firstInput.fill('Final answer');
    }
    
    await page.click('button[type="submit"]:has-text("Submit")');
    await waitForToast(page, /submitted|success/i);
    
    // Navigate to sessions
    await page.goto('/enumerator/sessions');
    
    // Look for close session button
    const closeButton = page.locator('button:has-text("Close Session"), button:has-text("End Session")');
    if (await closeButton.count() > 0) {
      await closeButton.click();
      
      // Confirm closure
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }
      
      // Session should be marked as closed
      await waitForToast(page, /closed|ended|completed/i);
    }
  });
  
});
