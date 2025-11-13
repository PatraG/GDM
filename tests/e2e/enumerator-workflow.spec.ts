/**
 * Enumerator Workflow E2E Tests
 * 
 * Tests the complete enumerator workflow:
 * 1. Create respondent
 * 2. Start session
 * 3. Fill out survey
 * 4. Submit response
 * 
 * @module tests/e2e/enumerator-workflow.spec.ts
 */

import { test, expect } from '@playwright/test';
import { 
  login, 
  TEST_USERS, 
  TEST_RESPONDENT,
  createTestRespondent,
  startSession,
  mockGeolocation,
  waitForToast,
} from './helpers';

test.describe('Enumerator Workflow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as enumerator before each test
    await login(page, TEST_USERS.enumerator);
    
    // Mock geolocation
    await mockGeolocation(page);
  });
  
  test('should complete full workflow: create respondent → start session → fill survey → submit', async ({ page }) => {
    // Step 1: Create respondent
    await page.goto('/enumerator/respondents');
    await page.click('button:has-text("New Respondent"), a:has-text("Create")');
    
    // Fill respondent form
    await page.selectOption('select[name="ageRange"]', TEST_RESPONDENT.ageRange);
    await page.selectOption('select[name="sex"]', TEST_RESPONDENT.sex);
    await page.fill('input[name="adminArea"]', TEST_RESPONDENT.adminArea);
    await page.check('input[type="checkbox"][name="consentGiven"]');
    
    // Submit respondent form
    await page.click('button[type="submit"]:has-text("Create")');
    
    // Wait for success and extract pseudonym
    await waitForToast(page, /created|success/i);
    const pseudonymText = await page.locator('text=/R-\\d{5}/').first().textContent();
    const pseudonym = pseudonymText?.match(/R-\d{5}/)?.[0];
    
    expect(pseudonym).toMatch(/R-\d{5}/);
    
    // Step 2: Start session
    await page.goto('/enumerator/sessions');
    
    // Search for the respondent we just created
    await page.fill('input[placeholder*="Search"], input[type="search"]', pseudonym!);
    await page.click(`text=${pseudonym}`);
    
    // Wait for session start confirmation
    await expect(page.locator('text=/session.*started|active/i')).toBeVisible({ timeout: 5000 });
    
    // Step 3: Select and fill survey
    await page.goto('/enumerator/surveys');
    
    // Select first available survey
    const firstSurvey = page.locator('[data-testid="survey-card"], .survey-item').first();
    await firstSurvey.click();
    
    // Wait for survey form to load
    await expect(page.locator('form, [data-testid="survey-form"]')).toBeVisible({ timeout: 5000 });
    
    // Fill out survey questions (example: fill first 3 questions)
    // Note: Actual selectors depend on survey structure
    const questions = page.locator('[data-testid="question"], .question-item');
    const questionCount = await questions.count();
    
    if (questionCount > 0) {
      for (let i = 0; i < Math.min(3, questionCount); i++) {
        const question = questions.nth(i);
        
        // Check if it's a text input
        const textInput = question.locator('input[type="text"], textarea');
        if (await textInput.count() > 0) {
          await textInput.first().fill(`Test answer ${i + 1}`);
        }
        
        // Check if it's a select/dropdown
        const selectInput = question.locator('select');
        if (await selectInput.count() > 0) {
          await selectInput.first().selectOption({ index: 1 });
        }
        
        // Check if it's a radio button
        const radioInput = question.locator('input[type="radio"]');
        if (await radioInput.count() > 0) {
          await radioInput.first().check();
        }
        
        // Check if it's a checkbox
        const checkboxInput = question.locator('input[type="checkbox"]');
        if (await checkboxInput.count() > 0) {
          await checkboxInput.first().check();
        }
      }
    }
    
    // Step 4: Submit survey
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // Wait for submission success
    await waitForToast(page, /submitted|success|complete/i);
    
    // Verify redirected to sessions or surveys page
    await expect(page).toHaveURL(/\/enumerator\/(sessions|surveys|home)/);
  });
  
  test('should create respondent with all required fields', async ({ page }) => {
    await page.goto('/enumerator/respondents');
    await page.click('button:has-text("New Respondent"), a:has-text("Create")');
    
    // Fill all fields
    await page.selectOption('select[name="ageRange"]', '35-44');
    await page.selectOption('select[name="sex"]', 'M');
    await page.fill('input[name="adminArea"]', 'Central District, Main Village');
    await page.check('input[type="checkbox"][name="consentGiven"]');
    
    // Submit
    await page.click('button[type="submit"]:has-text("Create")');
    
    // Should show success
    await waitForToast(page, /created|success/i);
    
    // Should display pseudonym
    await expect(page.locator('text=/R-\\d{5}/')).toBeVisible();
  });
  
  test('should prevent respondent creation without consent', async ({ page }) => {
    await page.goto('/enumerator/respondents');
    await page.click('button:has-text("New Respondent"), a:has-text("Create")');
    
    // Fill all fields except consent
    await page.selectOption('select[name="ageRange"]', '25-34');
    await page.selectOption('select[name="sex"]', 'F');
    await page.fill('input[name="adminArea"]', 'Test District');
    
    // Do NOT check consent checkbox
    
    // Try to submit
    await page.click('button[type="submit"]:has-text("Create")');
    
    // Should show validation error
    await expect(page.locator('text=/consent.*required|must.*consent/i')).toBeVisible({ timeout: 3000 });
  });
  
  test('should list created respondents', async ({ page }) => {
    // Create a respondent first
    const pseudonym = await createTestRespondent(page);
    
    // Navigate to respondents list
    await page.goto('/enumerator/respondents');
    
    // Should see the created respondent
    await expect(page.locator(`text=${pseudonym}`)).toBeVisible();
  });
  
  test('should search respondents by pseudonym', async ({ page }) => {
    // Create a respondent
    const pseudonym = await createTestRespondent(page);
    
    // Navigate to respondents page
    await page.goto('/enumerator/respondents');
    
    // Search for the respondent
    await page.fill('input[placeholder*="Search"], input[type="search"]', pseudonym);
    
    // Should display matching respondent
    await expect(page.locator(`text=${pseudonym}`)).toBeVisible();
  });
  
  test('should start session for respondent', async ({ page }) => {
    // Create respondent first
    const pseudonym = await createTestRespondent(page);
    
    // Navigate to sessions
    await page.goto('/enumerator/sessions');
    
    // Search for respondent
    await page.fill('input[placeholder*="Search"], input[type="search"]', pseudonym);
    
    // Click to start session
    await page.click(`text=${pseudonym}`);
    
    // Should confirm session started
    await expect(page.locator('text=/session.*started|active.*session/i')).toBeVisible({ timeout: 5000 });
  });
  
  test('should display active session information', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Navigate to sessions page
    await page.goto('/enumerator/sessions');
    
    // Should show active session indicator
    await expect(page.locator('text=/active|in progress|ongoing/i')).toBeVisible();
    
    // Should show respondent pseudonym
    await expect(page.locator(`text=${pseudonym}`)).toBeVisible();
  });
  
  test('should save draft survey response', async ({ page }) => {
    // Create respondent and start session
    const pseudonym = await createTestRespondent(page);
    await startSession(page, pseudonym);
    
    // Navigate to surveys and select one
    await page.goto('/enumerator/surveys');
    const firstSurvey = page.locator('[data-testid="survey-card"], .survey-item').first();
    await firstSurvey.click();
    
    // Fill partial answers
    const firstInput = page.locator('input[type="text"], textarea, select').first();
    if (await firstInput.count() > 0) {
      await firstInput.fill('Partial answer for draft');
    }
    
    // Click save draft button
    await page.click('button:has-text("Save Draft"), button:has-text("Save as Draft")');
    
    // Should show draft saved confirmation
    await waitForToast(page, /draft.*saved|saved.*draft/i);
  });
  
  test('should handle GPS permission granted', async ({ page }) => {
    // Grant geolocation permission
    await mockGeolocation(page, { latitude: -7.250474, longitude: 112.768883 });
    
    // Navigate to survey form (which captures GPS)
    await page.goto('/enumerator/surveys');
    
    // GPS coordinates should be captured automatically
    // Check if GPS indicator shows captured location
    await expect(page.locator('text=/gps|location|coordinates/i')).toBeVisible({ timeout: 5000 });
  });
  
});
