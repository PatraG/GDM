# Feature Specification: Enumerator & Respondent Survey Workflow

**Feature Branch**: `001-survey-workflow`  
**Created**: 2025-11-13  
**Status**: Draft  
**Input**: User description: "Enable administrators to register enumerator accounts and enable enumerators to: log in, register or select respondents, start a session/visit, fill one or more surveys for the same respondent in a single session, save and submit survey responses reliably"

---

## Summary

This feature establishes the core data collection workflow for the Oral Health Survey Web Application. It enables administrators to manage field worker (enumerator) accounts and provides enumerators with a streamlined interface to register respondents, conduct field sessions, and collect survey data through structured forms. The feature ensures data traceability, role-based access control, and compliance with privacy principles defined in the project Constitution.

**In Scope**:
- Administrator capabilities: create, activate, deactivate enumerator accounts with role assignment
- Enumerator authentication and home dashboard
- Respondent management: add new respondents with demographics, search existing respondents
- Session/visit management: start encounters, track timestamps and status
- Survey selection and form filling with validation
- Multiple surveys per session for the same respondent
- Response submission and confirmation
- Data model for users, respondents, sessions, surveys, questions, options, responses, and answers
- Basic status handling (draft/submitted, active/suspended)
- Access control: enumerators see only their data, admins see all

**Out of Scope** (handled by other features):
- Spatial analytics, map visualizations, and dashboard charts
- OHIP-14 or specific scoring algorithms
- Offline/PWA implementation
- Advanced consent documents or e-signatures
- Multi-tenant or clinic-level scoping

---

## Clarifications

### Session 2025-11-13

- Q: What specific format should respondent codes use? → A: Sequential with prefix (e.g., "R-00001", "R-00002")
- Q: What should happen when a session auto-closes due to timeout? → A: Close session, keep draft responses, allow enumerator to resume with new session
- Q: When should GPS coordinates be captured? → A: Per survey submission (location per questionnaire)
- Q: How should retry attempts be handled? → A: Manual retry with exponential backoff suggestion (show countdown timer)
- Q: Should administrators be notified of orphaned sessions when suspending an enumerator? → A: Show warning with session count before suspension, allow admin to proceed or cancel

---

## Stakeholders and Users

### Primary Users

**Administrator**:
- Manages enumerator accounts (create, activate, deactivate)
- Assigns roles and permissions
- Views all submissions across enumerators
- Can void/invalidate responses when necessary
- Access: Full system access

**Enumerator** (Field Worker):
- Authenticates to access the system
- Registers new respondents or selects existing ones
- Starts field sessions (encounters) with respondents
- Fills one or more surveys per session
- Submits validated survey responses
- Access: Limited to own respondents and sessions

### Secondary Stakeholders
- Data analysts (will use collected data in Analytics feature)
- Compliance officers (ensuring PDP Law adherence)
- System administrators (managing Appwrite infrastructure)

---

## User Scenarios & Testing

### User Story 1 - Enumerator Conducts Field Survey (Priority: P1)

An enumerator visits a respondent in the field, registers them (if new), starts a session, and fills a survey to collect oral health data.

**Why this priority**: This is the core value proposition - collecting survey data. Without this, the entire application has no purpose.

**Independent Test**: Can be fully tested by creating a test enumerator account, logging in, adding a respondent, starting a session, filling one survey, and verifying the response is saved. Delivers immediate value: structured data collection.

**Acceptance Scenarios**:

1. **Given** enumerator is logged in and on home dashboard, **When** they click "Add Respondent" and fill required demographics (age range, sex, area, consent checkbox), **Then** system generates unique respondent code and saves record
2. **Given** enumerator has added a respondent, **When** they select the respondent and click "Start Session", **Then** a new session is created with status=open and linked to current enumerator
3. **Given** enumerator is in an open session, **When** they select a survey from available list, **Then** survey form renders with all questions in correct order
4. **Given** enumerator is filling a survey form, **When** they attempt to submit with required fields empty, **Then** validation errors are displayed and submission is blocked
5. **Given** enumerator has completed a valid survey form, **When** they click Submit, **Then** response is saved with status=submitted and confirmation message appears

---

### User Story 2 - Enumerator Fills Multiple Surveys in Same Session (Priority: P2)

During a single field visit, an enumerator needs to collect data from multiple survey instruments for the same respondent.

**Why this priority**: Common field scenario where multiple questionnaires are administered. Enhances data collection efficiency without forcing multiple sessions.

**Independent Test**: After P1 implementation, test by submitting one survey in a session, then selecting another survey for the same respondent in the same session. Delivers value: comprehensive data collection per visit.

**Acceptance Scenarios**:

1. **Given** enumerator has just submitted a survey in an open session, **When** they click "Fill Another Survey", **Then** they return to survey selection list for the same respondent
2. **Given** enumerator selects a second survey in the same session, **When** they fill and submit it, **Then** both responses are linked to the same session with correct timestamps
3. **Given** enumerator has filled multiple surveys, **When** they view session summary, **Then** all submitted surveys are listed with submission timestamps

---

### User Story 3 - Enumerator Searches and Selects Existing Respondent (Priority: P2)

An enumerator returns to a respondent for a follow-up visit and needs to find their existing record to start a new session.

**Why this priority**: Enables longitudinal data collection. Critical for tracking oral health changes over time.

**Independent Test**: Create a respondent in P1 test, log out/back in, use search functionality to find respondent by code or demographics, start new session. Delivers value: follow-up data collection.

**Acceptance Scenarios**:

1. **Given** enumerator is on respondent search screen, **When** they enter respondent code, **Then** matching respondent appears in results
2. **Given** enumerator searches by demographics (age range, sex, area), **When** filters match multiple respondents, **Then** results list shows all matches with identifying details
3. **Given** enumerator selects a respondent from search results, **When** they click "Start New Session", **Then** new session is created for that respondent (previous sessions remain closed)
4. **Given** respondent has previous sessions, **When** enumerator views respondent details, **Then** history of previous sessions and surveys is visible

---

### User Story 4 - Administrator Manages Enumerator Accounts (Priority: P1)

An administrator needs to onboard new field workers by creating enumerator accounts with proper credentials and role assignment.

**Why this priority**: Without enumerators, no data collection can occur. This is a prerequisite for P1 survey workflow.

**Independent Test**: Admin logs in, creates enumerator account with email/password, new enumerator receives credentials, logs in successfully, and sees enumerator-specific views (not admin views). Delivers value: secure access control.

**Acceptance Scenarios**:

1. **Given** administrator is logged in, **When** they navigate to user management and click "Add Enumerator", **Then** enumerator creation form appears
2. **Given** administrator fills enumerator form (email, initial password, role=enumerator), **When** they submit, **Then** new account is created in Appwrite Auth and users collection
3. **Given** new enumerator account is created, **When** enumerator logs in with provided credentials, **Then** they see enumerator home dashboard (not admin dashboard)
4. **Given** administrator views enumerator list, **When** they toggle enumerator status to "suspended", **Then** that enumerator cannot log in
5. **Given** administrator reactivates a suspended enumerator, **When** enumerator attempts login, **Then** authentication succeeds and access is granted

---

### User Story 5 - Administrator Views Submission Overview (Priority: P3)

An administrator needs to monitor data collection progress by viewing submission counts per enumerator and checking data quality.

**Why this priority**: Important for project management and quality assurance but not critical for core data collection workflow.

**Independent Test**: After P1 and P4 are implemented, admin can log in and see a simple dashboard showing enumerator names, respondent counts, and survey submission counts. Delivers value: monitoring and accountability.

**Acceptance Scenarios**:

1. **Given** administrator is logged in, **When** they open submissions overview, **Then** they see list of all enumerators with submission counts
2. **Given** administrator views submissions, **When** they filter by date range, **Then** only submissions within that range are shown
3. **Given** administrator selects an enumerator, **When** they view details, **Then** all respondents and sessions for that enumerator are listed
4. **Given** administrator identifies an invalid response, **When** they mark it as "void", **Then** response status changes and it's excluded from analysis (soft delete, not hard delete)

---

### User Story 6 - Enumerator Authenticates Securely (Priority: P1)

Enumerators must authenticate with email and password to access the system, ensuring only authorized users can collect sensitive health data.

**Why this priority**: Security is foundational per Constitution Principle 3. No workflow should be accessible without authentication.

**Independent Test**: Visit app URL, see login form, attempt login with invalid credentials (fails), attempt with valid enumerator credentials (succeeds and redirects to enumerator dashboard). Delivers value: security and access control.

**Acceptance Scenarios**:

1. **Given** unauthenticated user visits app URL, **When** page loads, **Then** login form is displayed
2. **Given** user enters invalid email/password, **When** they submit, **Then** error message appears and no access is granted
3. **Given** enumerator enters valid email/password, **When** they submit, **Then** authentication succeeds and they're redirected to enumerator home
4. **Given** enumerator is authenticated, **When** they close browser and return later within session timeout, **Then** they remain logged in
5. **Given** enumerator is logged in, **When** they click logout, **Then** session ends and they're redirected to login form

---

### Edge Cases

- **What happens when enumerator starts session but loses connectivity before submitting survey?**  
  System should preserve draft state locally if possible, or display clear error message indicating submission failed and allow retry. (Offline handling is out of scope for MVP, so expect graceful error messaging and manual retry.)

- **What happens when administrator deactivates an enumerator who has an open session?**  
  Before suspension, system displays warning message: "This enumerator has [N] open session(s). Suspending will prevent login but sessions will remain in database. Continue?" Admin can proceed with suspension or cancel. Suspended enumerators cannot log in, but existing open sessions remain in database with all data intact. On next attempted login, enumerator sees "account suspended" message.

- **What happens when same respondent code is accidentally entered twice?**  
  System validates respondent code uniqueness before saving. If duplicate detected, error message prompts enumerator to search for existing respondent instead.

- **What happens when enumerator tries to edit a submitted response?**  
  Submitted responses are immutable for enumerators. Edit button is disabled/hidden. Only administrators can void responses via dedicated workflow.

- **What happens when survey has conditional questions (skip logic)?**  
  Initial MVP supports linear surveys only. Conditional logic is out of scope; all questions are shown in order. (May be addressed in future Survey Logic feature.)

- **What happens when network error occurs during submission?**  
  API call fails, user sees error message with manual retry button. System displays recommended wait time using exponential backoff pattern (e.g., "Please wait 5 seconds before retrying" after first failure, "Please wait 10 seconds" after second, etc.) with countdown timer. No partial data is saved unless explicitly designed as draft. User retains full control over retry timing.

- **What happens when respondent withdraws consent after data collection?**  
  Administrator must manually mark respondent and associated responses as "consent revoked" via admin interface. Data is soft-deleted (flagged, not physically removed) per Constitution retention rules.

- **What happens when a session times out after 2 hours of inactivity?**  
  Session status changes to "closed" automatically. Any draft responses are preserved with status=draft and linked to the closed session. Enumerator can start a new session for the same respondent and continue work. Previously saved draft responses remain accessible to admins for review.

---

## Requirements

### Functional Requirements

**Authentication & Authorization**:
- **FR-001**: System MUST authenticate users via email and password using Appwrite Auth
- **FR-002**: System MUST enforce role-based access control with two roles: admin and enumerator
- **FR-003**: System MUST prevent unauthenticated users from accessing any application routes except login
- **FR-004**: System MUST redirect authenticated enumerators to enumerator home dashboard
- **FR-005**: System MUST redirect authenticated administrators to admin dashboard
- **FR-006**: System MUST allow administrators to view all data; enumerators MUST only see data they created or are assigned to

**User Management (Admin)**:
- **FR-007**: Administrators MUST be able to create new enumerator accounts with email, initial password, and role=enumerator
- **FR-008**: System MUST store user metadata (role, status, created timestamp) in a users collection linked to Appwrite account
- **FR-009**: Administrators MUST be able to suspend/activate enumerator accounts
- **FR-009a**: Before suspending an enumerator, system MUST display warning showing count of open sessions; admin can proceed with suspension or cancel
- **FR-010**: Suspended enumerators MUST NOT be able to authenticate
- **FR-011**: System MUST display active enumerators in user management list with status indicators

**Respondent Management (Enumerator)**:
- **FR-012**: Enumerators MUST be able to add new respondents with required fields: age range, sex, administrative area, consent flag
- **FR-012a**: System MUST auto-generate respondent codes using sequential format with "R-" prefix (e.g., "R-00001", "R-00002")
- **FR-013**: System MUST validate respondent code uniqueness before saving
- **FR-014**: System MUST pseudonymize respondent data per Constitution privacy principles (no full names stored)
- **FR-015**: Enumerators MUST be able to search respondents by code
- **FR-016**: Enumerators MUST be able to filter respondents by demographics (age range, sex, area)
- **FR-017**: System MUST display search results with respondent code, basic demographics, and last session date
- **FR-018**: System MUST link each respondent to the enumerator who created them for access control

**Session/Visit Management (Enumerator)**:
- **FR-019**: Enumerators MUST be able to start a new session for a selected respondent
- **FR-020**: System MUST create session record with: sessionId, respondentId, enumeratorId, startTime timestamp, status=open
- **FR-021**: System MUST allow only one open session per enumerator at a time; UI MUST clearly indicate active session and prevent starting a new session until current session is closed
- **FR-022**: Enumerators MUST be able to end/close a session explicitly or system auto-closes after 2 hours of inactivity
- **FR-022a**: When session auto-closes due to timeout, system MUST preserve any draft responses and allow enumerator to resume work by starting a new session
- **FR-023**: System MUST record session metadata: start/end timestamps, status transitions
- **FR-024**: Closed sessions MUST be immutable; enumerators cannot reopen them

**Survey Selection and Form Rendering (Enumerator)**:
- **FR-025**: System MUST display list of available surveys within an open session
- **FR-026**: Enumerators MUST be able to select a survey to fill for the current respondent
- **FR-027**: System MUST render survey form with questions in stable, configured order
- **FR-028**: System MUST support question types: single choice (radio), multiple choice (checkbox), scale (numeric/Likert), free text
- **FR-029**: System MUST display question text, options (where applicable), and required field indicators
- **FR-030**: System MUST validate required fields before allowing submission
- **FR-031**: System MUST validate data types (e.g., numeric fields accept only numbers)

**Response Submission (Enumerator)**:
- **FR-032**: System MUST create a response record linked to: sessionId, surveyId, survey version, enumeratorId, timestamp
- **FR-033**: System MUST save individual answers linked to: responseId, questionId, answer value(s)
- **FR-033a**: System MUST capture GPS coordinates at survey submission if device supports geolocation; location stored per response for spatial analysis
- **FR-034**: System MUST set response status to "submitted" upon successful save
- **FR-035**: System MUST display confirmation message after successful submission
- **FR-036**: System MUST handle submission errors gracefully with manual retry option and exponential backoff guidance (e.g., countdown timer showing recommended wait time before retry)
- **FR-037**: Enumerators MUST be able to fill multiple surveys for the same respondent in the same session
- **FR-038**: System MUST allow enumerators to return to survey selection after submitting one survey within the same session

**Data Integrity and Immutability**:
- **FR-039**: Submitted responses MUST be immutable for enumerators (no edit capability)
- **FR-040**: Administrators MUST be able to void/invalidate responses via soft delete (status flag change)
- **FR-041**: System MUST NOT allow hard deletion of submitted responses; use status flags (active, void, archived)
- **FR-042**: System MUST log all response submissions with: timestamp, enumeratorId, responseId; logs stored in dedicated Appwrite collection or external logging service (e.g., Sentry)
- **FR-043**: System MUST version surveys; each response MUST reference the exact survey version used

**Admin Oversight**:
- **FR-044**: Administrators MUST be able to view all respondents across all enumerators
- **FR-045**: Administrators MUST be able to view all sessions and responses with filters (enumerator, date range, respondent)
- **FR-046**: Administrators MUST see submission counts per enumerator
- **FR-047**: Administrators MUST be able to void individual responses with reason annotation

### Key Entities

**User / Appwrite Account**:
- Represents: System users (administrators and enumerators)
- Key attributes: userId (Appwrite Account ID), email, role (admin | enumerator), status (active | suspended), createdAt, lastLoginAt
- Relationships: One user creates many respondents; one user (enumerator) conducts many sessions

**Respondent**:
- Represents: Survey participant with pseudonymized identity
- Key attributes: respondentId, pseudonymousCode (unique, format: "R-" + 5-digit sequential number, e.g., "R-00001"), ageRange (e.g., "18-24"), sex, administrativeArea, consentGiven (boolean), consentTimestamp, createdById (enumerator), createdAt, lastSessionDate (computed from most recent session.startedAt or stored denormalized for performance)
- Relationships: One respondent has many sessions over time; created by one enumerator

**Session**:
- Represents: A single field visit/encounter with a respondent
- Key attributes: sessionId, respondentId, enumeratorId, startTime, endTime, status (open | closed | timeout), metadata (notes, conditions)
- Relationships: One session belongs to one respondent and one enumerator; one session contains many responses (one per survey filled)

**Survey**:
- Represents: A structured questionnaire with versioning
- Key attributes: surveyId, title, description, version (semantic versioning), status (active | archived), createdAt, questions (array or relationship)
- Relationships: One survey has many questions; one survey version is referenced by many responses

**Question**:
- Represents: Individual question within a survey
- Key attributes: questionId, surveyId, questionText, questionType (single_choice | multiple_choice | scale | free_text), isRequired (boolean), order (integer for sequencing), options (for choice questions)
- Relationships: Belongs to one survey; has many options (if choice-based); referenced by many answers

**Option**:
- Represents: Possible answer choice for multiple-choice or single-choice questions
- Key attributes: optionId, questionId, optionText, value (numeric or text), order
- Relationships: Belongs to one question; selected in many answers

**Response**:
- Represents: Completed survey submission within a session
- Key attributes: responseId, sessionId, surveyId, surveyVersion, enumeratorId, submittedAt, location (GPS coordinates captured at submission, optional based on device capability), status (draft | submitted | void), voidReason (if applicable)
- Relationships: Belongs to one session; references one survey version; contains many answers; created by one enumerator

**Answer**:
- Represents: Individual answer to a question within a response
- Key attributes: answerId, responseId, questionId, answerValue (text, numeric, or array for multiple choice), createdAt
- Relationships: Belongs to one response; references one question

---

## Success Criteria

### Measurable Outcomes

**User Efficiency**:
- **SC-001**: Enumerators can complete respondent registration in under 1 minute
- **SC-002**: Enumerators can start a session and select a survey within 30 seconds of selecting a respondent
- **SC-003**: Survey forms render within 1 second (P95) after selection on normal network conditions
- **SC-004**: Enumerators can fill and submit a 20-question survey in under 5 minutes (assuming data is available)

**System Performance**:
- **SC-005**: API calls for respondent search return results in under 300ms (P95)
- **SC-006**: Survey submission completes within 500ms (P95) under normal load
- **SC-007**: System supports at least 20 concurrent enumerators conducting surveys without performance degradation

**Data Quality and Integrity**:
- **SC-008**: 100% of submitted responses are traceable to a specific enumerator, respondent, session, and timestamp
- **SC-009**: 0% of submitted responses can be edited by enumerators post-submission (immutability enforced)
- **SC-010**: 100% of responses reference a specific survey version for reproducibility
- **SC-011**: Validation catches 100% of required field omissions before submission

**User Success and Adoption**:
- **SC-012**: 90% of enumerators successfully complete their first survey submission without assistance
- **SC-013**: Average time from login to first survey submission is under 3 minutes for trained enumerators
- **SC-014**: Less than 5% of survey submissions fail due to system errors (network errors excluded)

**Security and Compliance**:
- **SC-015**: 100% of respondent data is pseudonymized (no full names stored except where explicitly required)
- **SC-016**: 100% of enumerators can only access their own respondents and sessions; admins can access all
- **SC-017**: 100% of authentication attempts use secure password policies (minimum 8 characters, complexity rules)
- **SC-018**: Audit logs capture 100% of response submissions and voids with user attribution

**Administrative Oversight**:
- **SC-019**: Administrators can view real-time submission counts per enumerator
- **SC-020**: Administrators can void/invalidate responses with reason annotation, and voided responses are excluded from analysis views

---

## Non-Functional Requirements

**Reliability**:
- Form submissions must be robust against transient network errors; display clear error messages and provide retry mechanisms
- System must preserve data integrity during partial failures (no orphaned records)

**Performance**:
- Form rendering and basic list queries must feel instant on normal network (target P95 < 1s after data fetch)
- API response times for CRUD operations: P95 < 300ms

**Privacy (per Constitution Principle 1)**:
- Respondent data must be pseudonymized by default (no full names unless explicitly justified)
- Only admins can see all respondents and sessions; enumerators see only their own data
- Explicit consent flag must be recorded per respondent before survey collection

**Security (per Constitution Principle 3)**:
- Only authenticated users with enumerator or admin role can access workflows
- No anonymous modification of respondents, sessions, or responses
- Role-based access control enforced at API and UI levels

**Maintainability (per Constitution Principle 4)**:
- Code must use TypeScript with strict type checking
- ESLint and Prettier must be enforced
- Critical workflows must have integration tests

**Observability (per Constitution Principle 6)**:
- Log all authentication attempts (success/failure)
- Log all survey submissions with timestamp and user
- Track API response times and error rates

---

## Risks and Open Questions

### Risks

1. **Network Reliability in Field Conditions**:
   - Risk: Enumerators may work in areas with unstable connectivity, leading to submission failures
   - Mitigation: Provide clear error messages and retry mechanisms; consider local draft storage in future PWA feature

2. **Survey Versioning Complexity**:
   - Risk: If surveys are modified mid-project, responses may reference different versions, complicating analysis
   - Mitigation: Lock survey versions before fieldwork begins; create new versions for changes; responses always reference survey version

3. **Data Privacy Compliance**:
   - Risk: Accidental collection of identifiable information violates UU PDP Law
   - Mitigation: UI validation prevents full name entry; training for enumerators; admin audit reviews

4. **Concurrent Session Management**:
   - Risk: Enumerators may forget to close sessions, leading to multiple open sessions and confusion
   - Mitigation: Auto-close sessions after inactivity timeout; UI warnings for open sessions

5. **Scale and Performance**:
   - Risk: As data grows (thousands of respondents, tens of thousands of responses), query performance may degrade
   - Mitigation: Implement pagination, indexing on Appwrite collections, caching where appropriate

### Open Questions

1. **Respondent Code Generation**: ✅ RESOLVED
   - Decision: Sequential format with "R-" prefix (e.g., "R-00001", "R-00002") for human readability and ease of verbal communication in field settings

2. **Session Auto-Close Timeout**: ✅ RESOLVED
   - Decision: 2-hour inactivity timeout; session closes automatically but preserves draft responses; enumerator can resume with new session

3. **Initial Admin Account Creation**:
   - How is the first administrator account created (manual Appwrite setup, seed script)?
   - **Assumption for MVP**: Manual creation via Appwrite Console before application launch; document in deployment guide

4. **Consent Documentation**:
   - Is a simple boolean consent flag sufficient, or are consent forms/signatures required?
   - **Assumption for MVP**: Boolean consent flag with timestamp; detailed consent documents out of scope (future feature)

5. **Multi-Survey Workflow UX**:
   - After submitting a survey, should enumerator explicitly choose "Fill another survey" or automatically return to survey list?
   - **Assumption for MVP**: Explicit button "Fill Another Survey" to give enumerator control; avoids accidental re-entry

---

## Assumptions

1. Appwrite Cloud is fully operational and accessible from enumerator devices
2. Enumerators have basic smartphone or tablet literacy and will receive training on the application
3. Internet connectivity is available during survey submission (offline mode deferred to future PWA feature)
4. Surveys are defined and configured in Appwrite Database before enumerators begin fieldwork
5. GPS/location capture occurs automatically at each survey submission if device supports geolocation; provides precise location per questionnaire for spatial analysis
6. Respondent age is collected as range (e.g., "18-24") not exact birthdate, per privacy principles
7. No conditional question logic (skip patterns) in MVP; all questions shown in order
8. Administrators have technical knowledge to use Appwrite Console for initial setup and emergency interventions

---

## Dependencies

- Appwrite Cloud services: Auth, Databases, Functions (if needed for validation logic)
- Constitution document defines core principles and data standards
- User training materials (out of scope for this spec, but required for deployment)
- Survey definitions must be created in database before enumerators can use the system

---

## Related Specifications

- **Analytics & Spatial Reporting Feature** (future): Will consume data collected through this workflow
- **Scoring Feature** (future): Will calculate OHIP-14 and other scores from collected responses
- **Offline/PWA Feature** (future): Will add local storage and sync capabilities to this workflow
- **Constitution v1.0.0**: Defines governance, privacy, security, and data standards

---

**End of Specification**
