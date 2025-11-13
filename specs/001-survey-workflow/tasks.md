# Tasks: Enumerator & Respondent Survey Workflow

**Input**: Design documents from `/specs/001-survey-workflow/`  
**Prerequisites**: plan.md ✅, spec.md ✅

**Tests**: Not included in this task list (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US4, US6)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router structure with `src/` at repository root
- Structure follows plan.md (Next.js 15 + Appwrite BaaS)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Verify Next.js project structure matches plan.md in src/ directory
- [ ] T002 [P] Install core dependencies: Appwrite SDK, React Hook Form, Zod, shadcn/ui components
- [ ] T003 [P] Configure TypeScript strict mode in tsconfig.json
- [ ] T004 [P] Configure ESLint and Prettier with pre-commit hooks
- [ ] T005 [P] Install and configure Tailwind CSS with shadcn/ui in tailwind.config.ts
- [ ] T006 Create Appwrite database `oral_health_survey` via Console (manual step - document in setup notes)
- [ ] T007 Create shadcn/ui components directory structure in src/components/ui/
- [ ] T008 Install initial shadcn/ui components: button, form, input, select, checkbox, card, table

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Appwrite Configuration

- [ ] T009 Create Appwrite client initialization in src/lib/appwrite/client.ts
- [ ] T010 Create Appwrite constants file in src/lib/appwrite/constants.ts (database ID, collection IDs)
- [ ] T011 Create environment variable validation in src/lib/appwrite/config.ts

### Type Definitions

- [ ] T012 [P] Create auth types in src/lib/types/auth.ts (User, Role, AuthSession)
- [ ] T013 [P] Create respondent types in src/lib/types/respondent.ts (Respondent, RespondentCreate, RespondentUpdate)
- [ ] T014 [P] Create session types in src/lib/types/session.ts (Session, SessionCreate, SessionStatus)
- [ ] T015 [P] Create survey types in src/lib/types/survey.ts (Survey, Question, Option, QuestionType)
- [ ] T016 [P] Create response types in src/lib/types/response.ts (Response, Answer, ResponseStatus)

### Appwrite Collections Setup (Manual via Console - Document Steps)

- [ ] T017 Create `users` collection with schema: userId, role, status, createdAt, updatedAt
- [ ] T018 Create `respondents` collection with schema: respondentId, pseudonym, ageRange, sex, adminArea, consentGiven, consentTimestamp, enumeratorId, createdAt
- [ ] T019 Create `sessions` collection with schema: sessionId, enumeratorId, startTime, endTime, status, createdAt, updatedAt
- [ ] T020 Create `surveys` collection with schema: surveyId, title, description, version, status, createdAt, updatedAt
- [ ] T020a Implement survey version locking logic (status: draft/locked/archived; block edits when status=locked)
- [ ] T021 Create `questions` collection with schema: questionId, surveyId, questionText, questionType, required, order, createdAt
- [ ] T022 Create `options` collection with schema: optionId, questionId, optionText, value, order
- [ ] T023 Create `responses` collection with schema: responseId, sessionId, respondentId, surveyId, surveyVersion, location, status, submittedAt, voidedBy, voidReason, createdAt, updatedAt
- [ ] T024 Create `answers` collection with schema: answerId, responseId, questionId, answerValue, createdAt
- [ ] T025 Set Appwrite permissions for all collections per plan.md (role:enumerator, role:admin)
- [ ] T026 Create indexes: respondents.pseudonym (unique), sessions.enumeratorId, responses.sessionId, responses.submittedAt

### Validation & Utilities

- [ ] T027 [P] Create Zod validation schemas in src/lib/utils/validation.ts (respondent, session, survey, response)
- [ ] T028 [P] Create formatters in src/lib/utils/formatters.ts (date, GPS coordinates, respondent code display)
- [ ] T029 Create respondent code generator in src/lib/utils/respondentCode.ts (R-00001 format)

### Base Layout & Shared Components

- [ ] T030 Create root layout in src/app/layout.tsx with Tailwind imports
- [ ] T031 [P] Create shared Header component in src/components/shared/Header.tsx
- [ ] T032 [P] Create ErrorBoundary component in src/components/shared/ErrorBoundary.tsx
- [ ] T033 [P] Create LoadingSpinner component in src/components/shared/LoadingSpinner.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 6 - Enumerator Authenticates Securely (Priority: P1) 🎯 MVP Foundation

**Goal**: Enable secure login/logout for enumerators with email and password, ensuring only authorized users can access the system.

**Independent Test**: Visit app URL, see login form, attempt login with invalid credentials (fails), attempt with valid enumerator credentials (succeeds and redirects to enumerator dashboard).

### Implementation for User Story 6

- [ ] T034 [P] [US6] Create Appwrite auth helpers in src/lib/appwrite/auth.ts (login, logout, getSession, getUser)
- [ ] T035 [P] [US6] Create useAuth hook in src/lib/hooks/useAuth.ts (authentication state, role detection)
- [ ] T036 [US6] Create auth layout group in src/app/(auth)/layout.tsx
- [ ] T037 [US6] Create login page in src/app/(auth)/login/page.tsx
- [ ] T038 [P] [US6] Create LoginForm component in src/components/auth/LoginForm.tsx
- [ ] T039 [US6] Create Next.js middleware in src/middleware.ts (route protection, role-based redirects)
- [ ] T040 [P] [US6] Create ProtectedRoute component in src/components/auth/ProtectedRoute.tsx
- [ ] T041 [US6] Create authenticated dashboard layout group in src/app/(dashboard)/layout.tsx
- [ ] T042 [US6] Add logout functionality to Header component
- [ ] T043 [US6] Implement session timeout detection (2-hour inactivity) in useAuth hook

**Checkpoint**: At this point, User Story 6 should be fully functional - users can log in, stay authenticated, and log out securely.

---

## Phase 4: User Story 4 - Administrator Manages Enumerator Accounts (Priority: P1) 🎯 MVP Foundation

**Goal**: Enable administrators to create, activate, deactivate enumerator accounts with proper role assignment.

**Independent Test**: Admin logs in, creates enumerator account with email/password, new enumerator receives credentials, logs in successfully, and sees enumerator-specific views (not admin views).

### Implementation for User Story 4

- [ ] T044 [US4] Create admin layout in src/app/(dashboard)/admin/layout.tsx with role gate
- [ ] T045 [US4] Create enumerators management page in src/app/(dashboard)/admin/enumerators/page.tsx
- [ ] T046 [P] [US4] Create EnumeratorList component in src/components/admin/EnumeratorList.tsx
- [ ] T047 [P] [US4] Create EnumeratorForm component in src/components/admin/EnumeratorForm.tsx (create/edit)
- [ ] T048 [US4] Create user service in src/lib/services/userService.ts (createEnumerator, listEnumerators, updateStatus)
- [ ] T049 [US4] Create Appwrite database helpers in src/lib/appwrite/databases.ts (CRUD wrappers)
- [ ] T050 [US4] Implement enumerator creation flow (Appwrite Auth + users collection)
- [ ] T051 [US4] Implement activation/deactivation with session warning modal
- [ ] T051a [US4] Add validation to block authentication attempts by suspended enumerators
- [ ] T052 [US4] Create enumerator detail view in src/app/(dashboard)/admin/enumerators/[id]/page.tsx
- [ ] T053 [US4] Add suspension warning logic (check for open sessions before deactivation)

**Checkpoint**: At this point, User Story 4 should be fully functional - admins can manage enumerators, and role-based access control is enforced.

---

## Phase 5: User Story 1 - Enumerator Conducts Field Survey (Priority: P1) 🎯 MVP Core

**Goal**: Enable enumerators to register respondents, start sessions, fill surveys, and submit responses with GPS coordinates.

**Independent Test**: Create test enumerator account, log in, add a respondent, start a session, fill one survey, and verify the response is saved with GPS coordinates.

### Enumerator Home Dashboard

- [ ] T054 [US1] Create enumerator layout in src/app/(dashboard)/enumerator/layout.tsx
- [ ] T055 [US1] Create enumerator home page in src/app/(dashboard)/enumerator/home/page.tsx

### Respondent Management

- [ ] T056 [P] [US1] Create respondent service in src/lib/services/respondentService.ts (create, list, search)
- [ ] T057 [US1] Create respondents page in src/app/(dashboard)/enumerator/respondents/page.tsx
- [ ] T058 [P] [US1] Create RespondentForm component in src/components/enumerator/RespondentForm.tsx
- [ ] T058a [US1] Add validation to block name-like patterns in respondent form fields (detect capitalized words, common name patterns)
- [ ] T059 [P] [US1] Create RespondentSearch component in src/components/enumerator/RespondentSearch.tsx
- [ ] T060 [US1] Implement respondent code generator integration (call from RespondentForm)
- [ ] T061 [US1] Add consent validation (checkbox must be checked before saving)
- [ ] T062 [US1] Implement respondent search by code and demographics

### Session Management

- [ ] T063 [P] [US1] Create session service in src/lib/services/sessionService.ts (create, close, list)
- [ ] T064 [P] [US1] Create useSession hook in src/lib/hooks/useSessions.ts (active session state)
- [ ] T065 [US1] Create sessions page in src/app/(dashboard)/enumerator/sessions/page.tsx
- [ ] T066 [P] [US1] Create SessionCard component in src/components/enumerator/SessionCard.tsx
- [ ] T067 [US1] Implement session creation flow (link to respondent and enumerator)
- [ ] T068 [US1] Implement session auto-close timer (2-hour inactivity with warning at 1:45)
- [ ] T069 [US1] Implement manual session close functionality
- [ ] T069a [US1] Add validation to prevent reopening closed sessions
- [ ] T070 [US1] Add draft preservation on timeout (keep response status=draft)

### Survey Engine

- [ ] T071 [P] [US1] Create survey service in src/lib/services/surveyService.ts (getSurveys, getSurveyWithQuestions)
- [ ] T072 [P] [US1] Create useSurveys hook in src/lib/hooks/useSurveys.ts (survey data fetching)
- [ ] T073 [US1] Create surveys page in src/app/(dashboard)/enumerator/surveys/page.tsx
- [ ] T074 [P] [US1] Create SurveySelector component in src/components/enumerator/SurveySelector.tsx
- [ ] T075 [P] [US1] Create SurveyForm component in src/components/enumerator/SurveyForm.tsx (dynamic form generation)
- [ ] T076 [US1] Implement dynamic question rendering (text, radio, checkbox, scale)
- [ ] T077 [US1] Integrate React Hook Form with Zod validation in SurveyForm
- [ ] T078 [US1] Implement GPS capture on survey load (browser Geolocation API)
- [ ] T079 [US1] Add GPS permission handling and error states
- [ ] T080 [US1] Display captured GPS coordinates to enumerator (readonly field)

### Response Submission

- [ ] T081 [P] [US1] Create response service in src/lib/services/responseService.ts (submitResponse, saveDraft)
- [ ] T082 [US1] Implement response creation with answers (transaction-like pattern)
- [ ] T083 [US1] Implement retry mechanism with exponential backoff (initial delay: 2s, multiplier: 2x, max attempts: 3)
- [ ] T084 [US1] Add retry countdown timer UI
- [ ] T085 [US1] Create submission confirmation UI with success message
- [ ] T086 [US1] Implement draft save functionality (status=draft)
- [ ] T087 [US1] Add validation to prevent submission with empty required fields

**Checkpoint**: At this point, User Story 1 should be fully functional - enumerators can conduct complete field surveys from login to submission.

---

## Phase 6: User Story 2 - Enumerator Fills Multiple Surveys in Same Session (Priority: P2)

**Goal**: Enable enumerators to collect data from multiple survey instruments for the same respondent in a single session.

**Independent Test**: After P1 implementation, test by submitting one survey in a session, then selecting another survey for the same respondent in the same session.

### Implementation for User Story 2

- [ ] T088 [US2] Add "Fill Another Survey" button to submission confirmation UI
- [ ] T089 [US2] Implement post-submission flow (return to SurveySelector without closing session)
- [ ] T090 [US2] Query responses by sessionId to track completed surveys
- [ ] T091 [US2] Add checkmark/badge to completed surveys in SurveySelector
- [ ] T092 [US2] Prevent duplicate survey submission in same session (UI warning)
- [ ] T093 [P] [US2] Create SessionSummary component in src/components/enumerator/SessionSummary.tsx
- [ ] T094 [US2] Display all submitted surveys with timestamps in SessionSummary
- [ ] T095 [US2] Show GPS coordinates for each submission in SessionSummary
- [ ] T096 [US2] Add session summary view to session page

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - enumerators can fill multiple surveys per session.

---

## Phase 7: User Story 3 - Enumerator Searches and Selects Existing Respondent (Priority: P2)

**Goal**: Enable enumerators to find existing respondent records for follow-up visits.

**Independent Test**: Create a respondent in P1 test, log out/back in, use search functionality to find respondent by code or demographics, start new session.

### Implementation for User Story 3

- [ ] T097 [US3] Enhance RespondentSearch component with advanced filters (age range, sex, admin area)
- [ ] T098 [US3] Implement respondent search by multiple criteria (code, demographics)
- [ ] T099 [US3] Add "Select Respondent" action from search results
- [ ] T100 [US3] Implement respondent detail view showing session history
- [ ] T101 [US3] Create respondent history page in src/app/(dashboard)/enumerator/respondents/[id]/page.tsx
- [ ] T102 [US3] Display previous sessions and surveys for selected respondent
- [ ] T103 [US3] Add "Start New Session" button for existing respondents
- [ ] T104 [US3] Ensure new sessions are independent (previous sessions remain closed)

**Checkpoint**: All enumerator workflows should now be complete - new and returning respondents can be managed.

---

## Phase 8: User Story 5 - Administrator Views Submission Overview (Priority: P3)

**Goal**: Enable administrators to monitor data collection progress and quality.

**Independent Test**: Admin logs in and sees dashboard showing enumerator names, respondent counts, and survey submission counts.

### Implementation for User Story 5

- [ ] T105 [US5] Create admin dashboard page in src/app/(dashboard)/admin/dashboard/page.tsx
- [ ] T106 [P] [US5] Create SubmissionStats component in src/components/admin/SubmissionStats.tsx
- [ ] T107 [US5] Implement submission list with filters (date range, enumerator, survey type)
- [ ] T108 [US5] Display submission overview table (responseId, enumerator, respondent, survey, timestamp, location)
- [ ] T109 [US5] Add date range filter to submission list
- [ ] T110 [US5] Add enumerator filter dropdown
- [ ] T111 [US5] Implement response void functionality with reason modal
- [ ] T112 [US5] Update response status to voided with voidedBy and voidReason fields
- [ ] T113 [US5] Create audit trail logging for void actions
- [ ] T114 [US5] Add submission statistics cards (total responses, responses today, active enumerators)
- [ ] T115 [P] [US5] Install and configure recharts or Chart.js for dashboard visualizations
- [ ] T116 [US5] Create bar chart showing responses by survey type
- [ ] T117 [US5] Create line chart showing responses over time
- [ ] T118 [US5] Implement CSV export functionality in src/lib/services/exportService.ts
- [ ] T119 [US5] Implement JSON export functionality
- [ ] T120 [US5] Add export button with format selection modal
- [ ] T121 [US5] Apply current filters to export data

**Checkpoint**: All core user stories should now be complete and independently functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Error Handling & UX

- [ ] T122 [P] Implement global error boundary with user-friendly messages
- [ ] T123 [P] Add loading states to all async operations
- [ ] T124 [P] Implement toast notifications for success/error messages
- [ ] T125 Add network status indicator (online/offline)
- [ ] T126 Implement form validation error display consistency across all forms

### Performance Optimization

- [ ] T127 [P] Add React.memo to frequently re-rendered components
- [ ] T128 Implement pagination for respondent and submission lists
- [ ] T129 Add lazy loading for survey forms with many questions
- [ ] T130 Optimize Appwrite queries with proper indexes (verify T026)

### Security & Compliance

- [ ] T131 Review and test Appwrite permission rules for all collections
- [ ] T132 Implement password strength indicator in EnumeratorForm
- [ ] T133 Add CSRF protection to all forms
- [ ] T134 Verify no PII exposure in API responses (audit all endpoints)
- [ ] T135 Test GPS coordinate precision (ensure privacy compliance)

### Observability & Logging

- [ ] T135a [P] Create logging service in src/lib/services/loggingService.ts
- [ ] T135b Log all authentication attempts (success/failure) with timestamp and userId
- [ ] T135c Log all survey submissions with metadata (responseId, enumeratorId, timestamp, location)
- [ ] T135d Integrate error tracking service (optional: Sentry or Appwrite logging collection)

### Documentation

- [ ] T136 [P] Create README with deployment instructions
- [ ] T137 [P] Document Appwrite project setup steps
- [ ] T138 [P] Document environment variables in .env.example
- [ ] T139 [P] Create enumerator quick-start guide with screenshots
- [ ] T140 [P] Create admin user guide for enumerator management
- [ ] T141 Create troubleshooting FAQ document

### Testing (Optional - Playwright Integration Tests)

- [ ] T142 [P] Setup Playwright test infrastructure in tests/e2e/
- [ ] T143 [P] Write login/logout flow test in tests/e2e/auth.spec.ts
- [ ] T144 [P] Write enumerator workflow E2E test in tests/e2e/enumerator-workflow.spec.ts
- [ ] T145 [P] Write multi-survey workflow test in tests/e2e/multi-survey.spec.ts
- [ ] T146 [P] Write admin dashboard test in tests/e2e/admin-dashboard.spec.ts
- [ ] T147 Test role-based access control (enumerators blocked from admin routes)
- [ ] T148 Test network failure retry mechanism
- [ ] T149 Test session timeout with draft preservation
- [ ] T150 Test GPS permission denial handling

### Deployment Readiness

- [ ] T151 Configure production build optimization
- [ ] T152 Set up Vercel/Netlify deployment configuration
- [ ] T153 Create production Appwrite project (if separate from dev)
- [ ] T154 Test production build locally
- [ ] T155 Document rollback procedures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 6 (Phase 3)**: Depends on Foundational phase - Authentication foundation
- **User Story 4 (Phase 4)**: Depends on User Story 6 (requires authentication)
- **User Story 1 (Phase 5)**: Depends on User Stories 6 & 4 (requires auth + enumerator accounts)
- **User Story 2 (Phase 6)**: Depends on User Story 1 (extends single-survey workflow)
- **User Story 3 (Phase 7)**: Depends on User Story 1 (extends respondent management)
- **User Story 5 (Phase 8)**: Depends on User Story 1 (requires submission data to display)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← BLOCKS ALL STORIES
    ↓
US6: Authentication (Phase 3) ← MUST COMPLETE FIRST
    ↓
US4: Admin Enumerator Management (Phase 4) ← REQUIRED FOR TESTING
    ↓
US1: Enumerator Conducts Survey (Phase 5) ← MVP CORE
    ↓
    ├→ US2: Multiple Surveys (Phase 6) ← Can start after US1
    ├→ US3: Search Respondent (Phase 7) ← Can start after US1
    └→ US5: Admin Dashboard (Phase 8) ← Can start after US1
```

### Critical Path (Sequential MVP)

1. **Phase 1**: Setup → **Phase 2**: Foundational (CRITICAL BLOCKER)
2. **Phase 3**: US6 Authentication (REQUIRED)
3. **Phase 4**: US4 Admin Management (REQUIRED FOR TESTING)
4. **Phase 5**: US1 Core Survey Workflow (MVP COMPLETE HERE) ✅
5. **Phase 6-8**: US2, US3, US5 (Optional enhancements)
6. **Phase 9**: Polish

### Within Each User Story

- All tasks marked [P] can run in parallel (different files)
- Non-parallel tasks must complete in listed order
- Story complete before moving to next priority

### Parallel Opportunities

#### During Setup (Phase 1)
```bash
# Can run simultaneously:
T002: Install dependencies
T003: Configure TypeScript
T004: Configure ESLint/Prettier
T005: Configure Tailwind
T007: Create component structure
```

#### During Foundational (Phase 2)
```bash
# All type definitions can run in parallel:
T012: auth.ts
T013: respondent.ts
T014: session.ts
T015: survey.ts
T016: response.ts

# Validation & utilities in parallel:
T027: validation.ts
T028: formatters.ts
T029: respondentCode.ts

# Shared components in parallel:
T031: Header.tsx
T032: ErrorBoundary.tsx
T033: LoadingSpinner.tsx
```

#### Within User Story 1 (Phase 5)
```bash
# Services can run in parallel:
T056: respondentService.ts
T071: surveyService.ts
T081: responseService.ts

# Components can run in parallel:
T058: RespondentForm.tsx
T059: RespondentSearch.tsx
T066: SessionCard.tsx
T074: SurveySelector.tsx
T075: SurveyForm.tsx

# Hooks can run in parallel:
T064: useSessions.ts
T072: useSurveys.ts
```

#### Across User Stories (After Foundational Complete)
```bash
# With multiple developers, after US6 and US4 complete:
Developer A: User Story 2 (Phase 6)
Developer B: User Story 3 (Phase 7)
Developer C: User Story 5 (Phase 8)
# All can proceed in parallel
```

---

## Parallel Example: User Story 1

```bash
# Step 1: Launch all services in parallel
Task T056: "Create respondent service in src/lib/services/respondentService.ts"
Task T071: "Create survey service in src/lib/services/surveyService.ts"
Task T081: "Create response service in src/lib/services/responseService.ts"

# Step 2: Launch all components in parallel (after services if needed)
Task T058: "Create RespondentForm component in src/components/enumerator/RespondentForm.tsx"
Task T059: "Create RespondentSearch component in src/components/enumerator/RespondentSearch.tsx"
Task T066: "Create SessionCard component in src/components/enumerator/SessionCard.tsx"
Task T074: "Create SurveySelector component in src/components/enumerator/SurveySelector.tsx"
Task T075: "Create SurveyForm component in src/components/enumerator/SurveyForm.tsx"

# Step 3: Integration tasks (sequential)
Task T060: Integrate respondent code generator
Task T067: Implement session creation flow
Task T082: Implement response creation
```

---

## Implementation Strategy

### MVP First (Core Stories Only)

**Minimum Viable Product**: Phases 1 → 2 → 3 → 4 → 5

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 6 (Authentication)
4. Complete Phase 4: User Story 4 (Admin creates enumerators)
5. Complete Phase 5: User Story 1 (Enumerator conducts survey)
6. **STOP and VALIDATE**: Test complete workflow end-to-end
7. Deploy/demo MVP (functional data collection system) ✅

**MVP Features**:
- ✅ Secure authentication
- ✅ Admin can create enumerators
- ✅ Enumerator can register respondents
- ✅ Enumerator can conduct surveys with GPS
- ✅ Data saved to Appwrite securely

### Incremental Delivery (Add Enhancements)

1. **Foundation**: Complete Phases 1-2 → Foundation ready
2. **MVP Release**: Add Phases 3-5 → Test independently → Deploy (Core workflow) ✅
3. **Enhancement 1**: Add Phase 6 (US2: Multi-survey) → Test → Deploy
4. **Enhancement 2**: Add Phase 7 (US3: Search respondent) → Test → Deploy
5. **Enhancement 3**: Add Phase 8 (US5: Admin dashboard) → Test → Deploy
6. **Polish Release**: Add Phase 9 → Final testing → Production launch

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup + Foundational (Phases 1-2)
2. **Together**: Complete US6 + US4 (Phases 3-4) - Authentication foundation
3. **Lead Developer**: Complete US1 (Phase 5) - Core MVP
4. **Once US1 Complete, Split**:
   - Developer A: User Story 2 (Phase 6)
   - Developer B: User Story 3 (Phase 7)
   - Developer C: User Story 5 (Phase 8)
5. **Together**: Polish (Phase 9)

---

## Task Summary

**Total Tasks**: 163 tasks (updated with analysis fixes)

**Breakdown by Phase**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 26 tasks (added T020a)
- Phase 3 (US6 - Auth): 10 tasks
- Phase 4 (US4 - Admin): 11 tasks (includes T051a)
- Phase 5 (US1 - Core Survey): 36 tasks (includes T058a, T069a)
- Phase 6 (US2 - Multi-Survey): 9 tasks
- Phase 7 (US3 - Search): 8 tasks
- Phase 8 (US5 - Admin Dashboard): 17 tasks
- Phase 9 (Polish): 38 tasks (includes T135a-d)

**MVP Tasks**: 91 tasks (Phases 1-5, updated)

**Parallel Opportunities**: 45+ tasks can run in parallel (marked with [P])

**Independent Test Criteria**:
- ✅ US6: Login/logout works, session persists, unauthorized access blocked
- ✅ US4: Admin creates enumerator, enumerator logs in with correct role, suspended users blocked (T051a)
- ✅ US1: Complete survey workflow from respondent registration to submission, closed sessions cannot be reopened (T069a)
- ✅ US2: Multiple surveys submitted in single session
- ✅ US3: Existing respondent found and new session started
- ✅ US5: Admin sees submission statistics and can void responses

**Suggested MVP Scope**: Phases 1-5 (US6 + US4 + US1) = 89 tasks

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual Appwrite setup tasks (T006, T017-T026) should be documented with screenshots
- Tests (T142-T150) are optional - only implement if E2E testing is prioritized
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
