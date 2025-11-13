# Implementation Plan: Enumerator & Respondent Survey Workflow

**Branch**: `001-survey-workflow` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-survey-workflow/spec.md`

---

## Summary

This feature implements the core data collection workflow enabling administrators to manage enumerator accounts and enumerators to conduct field surveys. The technical approach centers on **Appwrite Cloud** (Authentication, Databases, Functions) for all backend operations, **Next.js 15 App Router** with TypeScript for the frontend, and role-based access control to isolate enumerator data while granting admins full visibility. The system captures survey responses with GPS coordinates per submission, supports multiple surveys per session, and maintains data integrity through versioning and immutability patterns.

**Primary Requirement**: Enable structured oral health data collection through a web interface with robust authentication, respondent management, session tracking, multi-survey workflows, and privacy-compliant pseudonymization.

**Technical Approach**: 
- Backend-as-a-Service via Appwrite Cloud (no custom server)
- Type-safe React components with strict TypeScript
- Appwrite SDK for database CRUD and authentication
- Shadcn/ui components for consistent UI/UX
- Manual retry with exponential backoff for network failures
- Session auto-close after 2-hour inactivity with draft preservation

---

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 15.4.3 (App Router, React 19)  
**Primary Dependencies**: Appwrite Web SDK 16.x, Tailwind CSS 3.x, shadcn/ui, React Hook Form, Zod (validation)  
**Storage**: Appwrite Cloud Databases (Singapore: sgp.cloud.appwrite.io) | Database: `oral_health_survey`  
**Testing**: Playwright (integration tests), Vitest (unit tests), TypeScript strict type checking  
**Target Platform**: Web browsers (Chrome/Edge/Safari latest), responsive mobile/tablet (field worker devices)  
**Project Type**: Web application (Next.js frontend + Appwrite BaaS backend)  
**Performance Goals**: 
- Survey form rendering: P95 < 1s after data fetch
- API CRUD operations: P95 < 300ms
- Dashboard load time: P95 < 3s
- Real-time submission feedback: < 2s for success confirmation

**Constraints**: 
- Online-only for MVP (offline mode deferred to PWA feature)
- Indonesian PDP Law (UU PDP No. 27/2022) compliance: pseudonymized respondents, explicit consent tracking
- No custom backend servers allowed (Constitution Principle 5: Appwrite-only)
- All responses immutable once submitted (soft delete via status flags)

**Scale/Scope**: 
- 50-100 enumerators initially
- 5,000-10,000 respondents (target sample size)
- 20,000-50,000 survey responses (multiple surveys per respondent)
- 5-10 active survey instruments
- 3-month field data collection period

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle 1: Privacy & PDP Law Compliance
- **Status**: PASS
- **Evidence**: Respondents pseudonymized with sequential codes (R-00001), no full names collected, explicit consent flag required, GPS coordinates justified for spatial analysis
- **Requirements**: 
  - Implement respondent code generator with "R-" prefix and zero-padded sequential IDs
  - Consent checkbox mandatory before survey starts
  - Privacy policy link displayed on respondent registration form
  - Age collected as range (e.g., "18-24") not exact birthdate

### ✅ Principle 2: Data Integrity & Immutability
- **Status**: PASS
- **Evidence**: Survey versioning implemented, responses reference `surveyVersion`, submitted responses immutable (status-based lifecycle)
- **Requirements**:
  - Responses have `status` field: draft/submitted/voided
  - Answers cannot be modified after submission
  - Admin void action creates audit trail with reason annotation
  - Survey version locked before fieldwork begins

### ✅ Principle 3: Security & Access Control
- **Status**: PASS
- **Evidence**: Role-based permissions (admin/enumerator), enumerators see only own data, Appwrite Auth with secure password policies
- **Requirements**:
  - Implement Appwrite role-based permissions (`role:enumerator`, `role:admin`)
  - Password minimum 8 characters with complexity rules
  - Session timeout after inactivity (2 hours)
  - All API requests authenticated via Appwrite SDK

### ✅ Principle 4: Maintainability & Code Quality
- **Status**: PASS
- **Evidence**: TypeScript strict mode, ESLint + Prettier enforced, integration tests for critical flows
- **Requirements**:
  - `tsconfig.json` with strict: true
  - Pre-commit hooks for linting/formatting
  - Playwright tests for login, survey submission, multi-survey workflow
  - Component-based architecture with reusable UI elements

### ✅ Principle 5: Appwrite-Only Backend
- **Status**: PASS
- **Evidence**: No custom servers, all data in Appwrite Databases, Appwrite Auth for users, potential Appwrite Functions for validation
- **Requirements**:
  - All CRUD via Appwrite SDK (`databases.createDocument`, etc.)
  - Authentication via `account.createEmailPasswordSession`
  - File uploads (if consent forms added later) via Appwrite Storage
  - No Express/Fastify/custom Node.js servers

### ✅ Principle 6: Observability & Monitoring
- **Status**: PASS
- **Evidence**: Logging for auth attempts, survey submissions, errors; performance tracking
- **Requirements**:
  - Log authentication success/failure with timestamp
  - Log survey submissions with `userId`, `responseId`, `timestamp`
  - Track API response times (consider Sentry integration)
  - Admin dashboard shows real-time submission counts

### ✅ Principle 7: Offline Readiness (Future)
- **Status**: PASS (deferred architecture consideration)
- **Evidence**: MVP is online-only; architecture designed to support future PWA with IndexedDB queue
- **Requirements**:
  - API contracts designed to handle eventual sync conflicts (timestamp, version vectors)
  - Draft responses stored locally in future; server reconciles on reconnection
  - No immediate action required for MVP

**Overall Constitution Compliance**: ✅ **PASS** - All 7 principles satisfied. Proceed to Phase 0.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-survey-workflow/
├── plan.md              # This file
├── research.md          # Phase 0: Technical unknowns, library evaluations
├── data-model.md        # Phase 1: Appwrite collection schemas, relationships
├── quickstart.md        # Phase 1: Developer setup, first survey workflow
├── contracts/           # Phase 1: API contracts, type definitions
│   ├── auth.types.ts
│   ├── respondent.types.ts
│   ├── session.types.ts
│   ├── survey.types.ts
│   └── response.types.ts
├── checklists/
│   └── requirements.md  # Quality validation (already exists)
└── spec.md              # Feature specification (already exists)
```

### Source Code (repository root)

```text
# Web Application Structure (Next.js + Appwrite BaaS)

src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth layout group
│   │   ├── login/            # Login page
│   │   └── layout.tsx        # Auth-specific layout
│   ├── (dashboard)/          # Authenticated layout group
│   │   ├── admin/            # Admin routes (role-gated)
│   │   │   ├── enumerators/  # Manage enumerators
│   │   │   ├── dashboard/    # Admin overview
│   │   │   └── layout.tsx    # Admin-specific layout
│   │   ├── enumerator/       # Enumerator routes
│   │   │   ├── home/         # Enumerator dashboard
│   │   │   ├── respondents/  # Respondent management
│   │   │   ├── sessions/     # Session/visit tracking
│   │   │   └── surveys/      # Survey form rendering
│   │   └── layout.tsx        # Shared authenticated layout
│   ├── api/                  # API routes (if needed for server actions)
│   │   └── appwrite/         # Appwrite server SDK wrappers
│   ├── globals.css           # Tailwind imports
│   └── layout.tsx            # Root layout
│
├── components/               # React components
│   ├── ui/                   # shadcn/ui primitives (button, form, etc.)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── admin/
│   │   ├── EnumeratorList.tsx
│   │   ├── EnumeratorForm.tsx
│   │   └── SubmissionStats.tsx
│   ├── enumerator/
│   │   ├── RespondentSearch.tsx
│   │   ├── RespondentForm.tsx
│   │   ├── SessionCard.tsx
│   │   ├── SurveySelector.tsx
│   │   └── SurveyForm.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── ErrorBoundary.tsx
│       └── LoadingSpinner.tsx
│
├── lib/                      # Utilities and services
│   ├── appwrite/
│   │   ├── client.ts         # Appwrite client initialization
│   │   ├── auth.ts           # Authentication helpers
│   │   ├── databases.ts      # Database CRUD wrappers
│   │   └── constants.ts      # Collection IDs, database ID
│   ├── services/
│   │   ├── respondentService.ts
│   │   ├── sessionService.ts
│   │   ├── surveyService.ts
│   │   └── responseService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRespondents.ts
│   │   ├── useSessions.ts
│   │   └── useSurveys.ts
│   ├── utils/
│   │   ├── validation.ts     # Zod schemas
│   │   ├── formatters.ts     # Date, GPS formatting
│   │   └── respondentCode.ts # R-00001 generator
│   └── types/
│       ├── auth.ts
│       ├── respondent.ts
│       ├── session.ts
│       ├── survey.ts
│       └── response.ts
│
├── middleware.ts             # Next.js middleware (auth checks)
├── tsconfig.json             # TypeScript config (strict: true)
├── tailwind.config.ts        # Tailwind + shadcn/ui config
├── components.json           # shadcn/ui config
└── .env.local                # Appwrite credentials (already exists)

tests/
├── e2e/                      # Playwright integration tests
│   ├── auth.spec.ts          # Login/logout flows
│   ├── enumerator-workflow.spec.ts  # Full survey workflow
│   ├── admin-dashboard.spec.ts      # Admin CRUD operations
│   └── multi-survey.spec.ts         # Multiple surveys in session
├── unit/                     # Vitest unit tests
│   ├── respondentCode.test.ts
│   ├── validation.test.ts
│   └── services/
│       ├── respondentService.test.ts
│       └── sessionService.test.ts
└── fixtures/                 # Test data
    ├── users.json
    ├── respondents.json
    └── surveys.json

public/
└── images/                   # Static assets (logos, etc.)
```

**Structure Decision**: Web application structure selected (Option 2 variant). Rationale: Project uses Next.js frontend with Appwrite BaaS backend (no custom backend code). All server logic encapsulated in Appwrite Functions or Next.js Server Actions if needed. Structure aligns with Next.js 15 App Router conventions and Constitution Principle 5 (Appwrite-only backend).

---

## Complexity Tracking

**No Constitution violations detected.** This section intentionally left empty (no complexity exceptions required).

---

## Hierarchical Task Plan

This plan is structured in **Epic → Task → Subtask** format. Tasks are sequenced to minimize blocking dependencies and enable parallel work streams where possible.

### **Phase 0: Research & Technology Validation**

**Goal**: Resolve technical unknowns and document decisions before detailed design.

#### Epic 0.1: Appwrite SDK & Authentication Patterns
- **Task 0.1.1**: Validate Appwrite Web SDK v16 compatibility with Next.js 15 App Router
  - Subtask: Test client-side SDK initialization in browser components
  - Subtask: Test server-side SDK usage in Server Components and Server Actions
  - Subtask: Document pattern for session management (cookies vs localStorage)
- **Task 0.1.2**: Research role-based permission implementation in Appwrite
  - Subtask: Test `role:enumerator` and `role:admin` permission rules in database collections
  - Subtask: Verify if roles can be assigned via Appwrite Auth or require custom `users` collection
  - Subtask: Document permission inheritance patterns (collection-level vs document-level)
- **Task 0.1.3**: Evaluate session timeout and auto-close mechanisms
  - Subtask: Test Appwrite session expiry configuration
  - Subtask: Design client-side inactivity detector (2-hour timeout)
  - Subtask: Document draft preservation strategy (localStorage vs Appwrite draft status)

#### Epic 0.2: GPS Capture & Validation
- **Task 0.2.1**: Test browser Geolocation API across target devices (mobile/tablet)
  - Subtask: Validate accuracy and latency on Chrome/Safari mobile
  - Subtask: Handle permission denials and timeout errors
  - Subtask: Document fallback behavior if GPS unavailable
- **Task 0.2.2**: Design GPS data structure for Appwrite storage
  - Subtask: Determine precision requirements (decimal places)
  - Subtask: Test storage of GeoJSON vs lat/lng separate fields
  - Subtask: Validate Appwrite geospatial query capabilities (for future analytics)

#### Epic 0.3: Form Validation & State Management
- **Task 0.3.1**: Evaluate React Hook Form + Zod integration
  - Subtask: Test dynamic form generation from Appwrite survey schema
  - Subtask: Validate nested question types (text, radio, checkbox, scale)
  - Subtask: Document error handling and validation message patterns
- **Task 0.3.2**: Research survey versioning strategy
  - Subtask: Design version locking mechanism (prevent edits during fieldwork)
  - Subtask: Test response-to-survey-version FK integrity in Appwrite
  - Subtask: Document migration path if survey updated mid-project

#### Epic 0.4: Network Reliability & Retry Logic
- **Task 0.4.1**: Design exponential backoff retry mechanism
  - Subtask: Implement retry wrapper for Appwrite SDK calls
  - Subtask: Test behavior under simulated network failures (Playwright network throttling)
  - Subtask: Document user feedback during retries (countdown timer, progress indicators)

**Deliverable**: `research.md` documenting all findings, code samples, and technical decisions.

---

### **Phase 1: Data Model & API Contracts**

**Goal**: Define Appwrite collection schemas and TypeScript type definitions.

#### Epic 1.1: Appwrite Database Schema Design
- **Task 1.1.1**: Create `users` collection schema
  - Subtask: Define attributes: `userId` (FK to Appwrite Account), `role`, `status`, `createdAt`, `updatedAt`
  - Subtask: Set permissions: admins full access, enumerators read-only own document
  - Subtask: Document relationship to Appwrite Auth accounts
- **Task 1.1.2**: Create `respondents` collection schema
  - Subtask: Define attributes: `respondentId` (auto UUID), `pseudonym` (indexed, e.g., "R-00001"), `ageRange`, `sex`, `adminArea`, `consentGiven`, `consentTimestamp`, `enumeratorId`, `createdAt`
  - Subtask: Set permissions: enumerators CRUD own respondents, admins read all
  - Subtask: Design unique constraint on `pseudonym` (sequential code generator)
- **Task 1.1.3**: Create `sessions` collection schema
  - Subtask: Define attributes: `sessionId`, `enumeratorId`, `startTime`, `endTime`, `status` (open/closed/timeout), `createdAt`, `updatedAt`
  - Subtask: Set permissions: enumerators CRUD own sessions, admins read all
  - Subtask: Document auto-close trigger (2-hour timeout via client-side logic or Appwrite Function)
- **Task 1.1.4**: Create `surveys` collection schema
  - Subtask: Define attributes: `surveyId`, `title`, `description`, `version`, `status` (draft/locked/archived), `createdAt`, `updatedAt`
  - Subtask: Set permissions: admins full CRUD, enumerators read-only
  - Subtask: Document version locking workflow
- **Task 1.1.5**: Create `questions` collection schema
  - Subtask: Define attributes: `questionId`, `surveyId` (FK), `questionText`, `questionType` (text/radio/checkbox/scale), `required`, `order`, `createdAt`
  - Subtask: Set permissions: admins full CRUD, enumerators read-only
  - Subtask: Document ordering and conditional logic (future: skip patterns)
- **Task 1.1.6**: Create `options` collection schema
  - Subtask: Define attributes: `optionId`, `questionId` (FK), `optionText`, `value`, `order`
  - Subtask: Set permissions: admins full CRUD, enumerators read-only
- **Task 1.1.7**: Create `responses` collection schema
  - Subtask: Define attributes: `responseId`, `sessionId` (FK), `respondentId` (FK), `surveyId` (FK), `surveyVersion`, `location` (GeoJSON or lat/lng), `status` (draft/submitted/voided), `submittedAt`, `voidedBy`, `voidReason`, `createdAt`, `updatedAt`
  - Subtask: Set permissions: enumerators create/read own, admins full access
  - Subtask: Document immutability rule (status=submitted locks answers)
- **Task 1.1.8**: Create `answers` collection schema
  - Subtask: Define attributes: `answerId`, `responseId` (FK), `questionId` (FK), `answerValue` (JSON for flexibility), `createdAt`
  - Subtask: Set permissions: enumerators create with response, admins read all
  - Subtask: Document value storage (text, number, array for checkboxes)

**Deliverable**: `data-model.md` with ER diagram, collection schemas, permission matrix, and relationship documentation.

#### Epic 1.2: TypeScript Type Definitions
- **Task 1.2.1**: Generate TypeScript types for all collections
  - Subtask: Create `contracts/auth.types.ts` (User, Role, Session)
  - Subtask: Create `contracts/respondent.types.ts` (Respondent, RespondentCreate, RespondentUpdate)
  - Subtask: Create `contracts/session.types.ts` (Session, SessionCreate, SessionClose)
  - Subtask: Create `contracts/survey.types.ts` (Survey, Question, Option, QuestionType)
  - Subtask: Create `contracts/response.types.ts` (Response, Answer, ResponseStatus)
- **Task 1.2.2**: Define Zod validation schemas matching TypeScript types
  - Subtask: Create `lib/utils/validation.ts` with schemas for all forms
  - Subtask: Document validation rules (required fields, age range enum, sex enum)

**Deliverable**: `contracts/*.types.ts` files with complete type definitions and Zod schemas.

#### Epic 1.3: Quickstart Guide
- **Task 1.3.1**: Document Appwrite project setup steps
  - Subtask: Database creation (`oral_health_survey`)
  - Subtask: Collection creation via Appwrite Console or CLI
  - Subtask: Index creation (e.g., `pseudonym` unique, `enumeratorId` indexed)
  - Subtask: Initial admin account creation
- **Task 1.3.2**: Document local development setup
  - Subtask: Environment variables (`.env.local` template)
  - Subtask: npm install and dev server startup
  - Subtask: Seed data script (sample surveys, test users)
- **Task 1.3.3**: Write first survey workflow tutorial
  - Subtask: Step-by-step: login → add respondent → start session → fill survey → submit
  - Subtask: Include screenshots and expected outcomes

**Deliverable**: `quickstart.md` with complete setup and first-run instructions.

---

### **Phase 2: Core Implementation**

**Goal**: Build working features following priority order from spec (P1 → P2 → P3).

#### Epic 2.1: Authentication & Authorization (Prerequisite for all features)
- **Task 2.1.1**: Implement Appwrite client initialization
  - Subtask: Create `lib/appwrite/client.ts` with SDK setup
  - Subtask: Create `lib/appwrite/auth.ts` with login/logout/session helpers
  - Subtask: Test server vs client SDK usage patterns
- **Task 2.1.2**: Build login page (`app/(auth)/login/page.tsx`)
  - Subtask: Create `LoginForm` component with email/password fields
  - Subtask: Integrate Appwrite `account.createEmailPasswordSession`
  - Subtask: Handle errors (invalid credentials, network failures)
  - Subtask: Redirect to role-specific dashboard (admin vs enumerator)
- **Task 2.1.3**: Implement role-based routing middleware
  - Subtask: Create `middleware.ts` to check authentication on protected routes
  - Subtask: Create `useAuth` hook to expose user role and permissions
  - Subtask: Test access control: enumerators cannot access `/admin/*`
- **Task 2.1.4**: Build logout functionality
  - Subtask: Add logout button to header
  - Subtask: Call `account.deleteSession` and redirect to login

**Dependencies**: None (foundational)  
**Testing**: Playwright test for login/logout flow.

---

#### Epic 2.2: Respondent Management (P1: User Story 1 foundation)
- **Task 2.2.1**: Implement respondent code generator
  - Subtask: Create `lib/utils/respondentCode.ts` with sequential ID logic
  - Subtask: Query Appwrite to get max existing code and increment
  - Subtask: Format as "R-00001" (zero-padded 5 digits)
  - Subtask: Handle concurrent creation (test race conditions)
- **Task 2.2.2**: Build RespondentForm component
  - Subtask: Create `components/enumerator/RespondentForm.tsx`
  - Subtask: Fields: age range (dropdown), sex (radio), admin area (dropdown), consent (checkbox)
  - Subtask: Integrate React Hook Form + Zod validation
  - Subtask: Display generated respondent code after submission
- **Task 2.2.3**: Implement respondent creation service
  - Subtask: Create `lib/services/respondentService.ts` with `createRespondent()`
  - Subtask: Call Appwrite `databases.createDocument` with validated data
  - Subtask: Handle errors (network, validation, duplicate codes)
- **Task 2.2.4**: Build respondent search/list UI
  - Subtask: Create `components/enumerator/RespondentSearch.tsx`
  - Subtask: Search by code or demographics
  - Subtask: Display paginated list of enumerator's respondents
  - Subtask: Filter by consent status (show only consented for surveys)
- **Task 2.2.5**: Integrate respondent selection into workflow
  - Subtask: Add "Select Respondent" action from search results
  - Subtask: Store selected respondent in React state/context
  - Subtask: Enable "Start Session" button when respondent selected

**Dependencies**: Epic 2.1 (authentication required)  
**Testing**: Playwright test for respondent creation and search.

---

#### Epic 2.3: Session Management (P1: User Story 1 foundation)
- **Task 2.3.1**: Implement session creation service
  - Subtask: Create `lib/services/sessionService.ts` with `createSession(enumeratorId)`
  - Subtask: Store start time, set status=open
  - Subtask: Return sessionId for linking responses
- **Task 2.3.2**: Build SessionCard component
  - Subtask: Display session metadata (start time, respondent, status)
  - Subtask: Show "Active Session" indicator
  - Subtask: Add "End Session" button
- **Task 2.3.3**: Implement session auto-close timer
  - Subtask: Create client-side inactivity detector (2-hour timeout)
  - Subtask: Display warning at 1:45 (15 min before close)
  - Subtask: Auto-close session and set status=timeout
  - Subtask: Preserve draft responses (do not delete)
- **Task 2.3.4**: Implement manual session close
  - Subtask: Call `sessionService.closeSession(sessionId)` on button click
  - Subtask: Update status=closed, set end time
  - Subtask: Redirect to enumerator home
- **Task 2.3.5**: Handle session resumption
  - Subtask: Allow enumerator to view draft responses from timed-out sessions
  - Subtask: Create new session to continue with same respondent
  - Subtask: Link new session to previous drafts (document pattern)

**Dependencies**: Epic 2.1, Epic 2.2  
**Testing**: Playwright test for session lifecycle (start, timeout, close).

---

#### Epic 2.4: Survey Engine - Form Rendering (P1: User Story 1 core)
- **Task 2.4.1**: Build survey selector UI
  - Subtask: Create `components/enumerator/SurveySelector.tsx`
  - Subtask: Fetch active surveys from Appwrite
  - Subtask: Display survey title, description, version
  - Subtask: Filter surveys applicable to session (future: conditional logic)
- **Task 2.4.2**: Implement dynamic survey form generator
  - Subtask: Create `components/enumerator/SurveyForm.tsx`
  - Subtask: Fetch questions and options for selected survey
  - Subtask: Render question types: text, radio, checkbox, scale (Likert)
  - Subtask: Apply ordering (question.order field)
  - Subtask: Integrate React Hook Form for state management
- **Task 2.4.3**: Implement form validation
  - Subtask: Use Zod schemas from `lib/utils/validation.ts`
  - Subtask: Show inline errors for required fields
  - Subtask: Disable submit button until validation passes
  - Subtask: Test all question types for validation correctness
- **Task 2.4.4**: Implement GPS capture on form load
  - Subtask: Request Geolocation API permission when survey selected
  - Subtask: Store lat/lng in form state
  - Subtask: Handle permission denial (show warning, allow manual coordinates entry)
  - Subtask: Display captured coordinates to enumerator (readonly field)

**Dependencies**: Epic 2.3 (session must be active)  
**Testing**: Unit tests for form generation logic, Playwright test for form rendering and validation.

---

#### Epic 2.5: Response Submission (P1: User Story 1 completion)
- **Task 2.5.1**: Implement response creation service
  - Subtask: Create `lib/services/responseService.ts` with `submitResponse()`
  - Subtask: Create response document with sessionId, respondentId, surveyId, surveyVersion, location, status=submitted
  - Subtask: Create answer documents for each question response
  - Subtask: Use Appwrite batch/transaction if available (or sequential creates with rollback on error)
- **Task 2.5.2**: Implement retry mechanism for network failures
  - Subtask: Wrap `submitResponse()` with exponential backoff retry logic
  - Subtask: Display retry countdown timer to enumerator
  - Subtask: Log retry attempts for debugging
  - Subtask: Show success confirmation after successful submission
- **Task 2.5.3**: Build submission confirmation UI
  - Subtask: Display success message with responseId
  - Subtask: Show "Fill Another Survey" button (P2 feature integration)
  - Subtask: Show "End Session" button
  - Subtask: Clear form state after successful submission
- **Task 2.5.4**: Implement draft save functionality (optional)
  - Subtask: Add "Save Draft" button to form
  - Subtask: Create response with status=draft
  - Subtask: Allow enumerator to resume draft later
  - Subtask: Test draft-to-submitted transition

**Dependencies**: Epic 2.4  
**Testing**: Playwright test for successful submission, network failure retry, draft save/resume.

---

#### Epic 2.6: Multi-Survey Workflow (P2: User Story 2)
- **Task 2.6.1**: Implement post-submission survey selector
  - Subtask: After successful submission, show survey list again
  - Subtask: Add "Fill Another Survey" button that returns to SurveySelector
  - Subtask: Maintain active session (do not auto-close)
- **Task 2.6.2**: Track completed surveys in session
  - Subtask: Query responses by sessionId to show completed surveys
  - Subtask: Display checkmark/badge on completed surveys in selector
  - Subtask: Prevent duplicate submission of same survey in session (UI warning)
- **Task 2.6.3**: Implement session summary view
  - Subtask: Create `components/enumerator/SessionSummary.tsx`
  - Subtask: List all submitted surveys with timestamps
  - Subtask: Show GPS coordinates for each submission
  - Subtask: Allow enumerator to review before ending session

**Dependencies**: Epic 2.5  
**Testing**: Playwright test for multi-survey submission in single session.

---

#### Epic 2.7: Admin Dashboard - Enumerator Management (P2: User Story 3)
- **Task 2.7.1**: Build enumerator list UI
  - Subtask: Create `app/(dashboard)/admin/enumerators/page.tsx`
  - Subtask: Fetch all users with role=enumerator from `users` collection
  - Subtask: Display table with columns: email, status, created date
  - Subtask: Add action buttons: Activate, Deactivate, View Details
- **Task 2.7.2**: Implement enumerator creation form
  - Subtask: Create `components/admin/EnumeratorForm.tsx`
  - Subtask: Fields: email, password, confirm password
  - Subtask: Call Appwrite `account.create()` to register user
  - Subtask: Create corresponding document in `users` collection with role=enumerator, status=active
- **Task 2.7.3**: Implement enumerator activation/deactivation
  - Subtask: Update `users.status` field to active/inactive
  - Subtask: Show warning if enumerator has open sessions before suspension
  - Subtask: Display session count in warning modal
  - Subtask: Allow admin to proceed or cancel suspension
- **Task 2.7.4**: Build enumerator detail view
  - Subtask: Show submission statistics (total responses, by survey type)
  - Subtask: Show recent activity (last login, last submission)
  - Subtask: Show list of respondents registered by this enumerator

**Dependencies**: Epic 2.1  
**Testing**: Playwright test for enumerator CRUD operations.

---

#### Epic 2.8: Admin Dashboard - Submission Oversight (P3: User Story 4)
- **Task 2.8.1**: Build submission list UI
  - Subtask: Create `app/(dashboard)/admin/dashboard/page.tsx`
  - Subtask: Fetch all responses with status=submitted
  - Subtask: Display table: responseId, enumerator, respondent, survey, timestamp, location
  - Subtask: Add filters: date range, enumerator, survey type, admin area
- **Task 2.8.2**: Implement response void functionality
  - Subtask: Add "Void" button to each response row
  - Subtask: Show modal for void reason annotation
  - Subtask: Update response status=voided, add voidedBy and voidReason
  - Subtask: Log void action in audit trail
- **Task 2.8.3**: Build submission statistics dashboard
  - Subtask: Create `components/admin/SubmissionStats.tsx`
  - Subtask: Show cards: total responses, responses today, active enumerators
  - Subtask: Show bar chart: responses by survey type
  - Subtask: Show line chart: responses over time
  - Subtask: Use simple charts (recharts or Chart.js, not complex spatial analytics)

**Dependencies**: Epic 2.5, Epic 2.7  
**Testing**: Playwright test for admin submission view and void action.

---

#### Epic 2.9: Data Export (P3: User Story 5)
- **Task 2.9.1**: Implement CSV export service
  - Subtask: Create `lib/services/exportService.ts` with `exportToCSV()`
  - Subtask: Query responses with applied filters (date, enumerator, survey)
  - Subtask: Join with answers, questions, respondents to create flat table
  - Subtask: Generate CSV file and trigger browser download
- **Task 2.9.2**: Implement JSON export service
  - Subtask: Create `exportToJSON()` function
  - Subtask: Structure JSON with nested responses/answers
  - Subtask: Include metadata (export timestamp, filters applied)
- **Task 2.9.3**: Build export UI in admin dashboard
  - Subtask: Add "Export" button to submission list
  - Subtask: Show modal with format selection (CSV/JSON)
  - Subtask: Apply current filters to export
  - Subtask: Show progress indicator for large exports

**Dependencies**: Epic 2.8  
**Testing**: Unit test for export data transformation, manual test for file download.

---

### **Phase 3: Quality Assurance & Polish**

**Goal**: Comprehensive testing, error handling, performance optimization, and deployment readiness.

#### Epic 3.1: Integration Testing
- **Task 3.1.1**: Write Playwright tests for all user stories
  - Subtask: Test P1 (enumerator survey workflow end-to-end)
  - Subtask: Test P2 (multi-survey in session)
  - Subtask: Test P2 (admin enumerator management)
  - Subtask: Test P3 (admin dashboard and void action)
  - Subtask: Test P3 (data export)
- **Task 3.1.2**: Test role-based access control
  - Subtask: Verify enumerators cannot access admin routes
  - Subtask: Verify enumerators see only own respondents/sessions
  - Subtask: Verify admins see all data
- **Task 3.1.3**: Test error scenarios
  - Subtask: Network failures during submission (retry mechanism)
  - Subtask: Session timeout with draft preservation
  - Subtask: GPS permission denial
  - Subtask: Invalid form data (validation errors)

#### Epic 3.2: Performance Optimization
- **Task 3.2.1**: Optimize survey form rendering
  - Subtask: Profile component render times
  - Subtask: Implement lazy loading for large surveys
  - Subtask: Memoize question components to prevent re-renders
  - Subtask: Test P95 < 1s target
- **Task 3.2.2**: Optimize dashboard queries
  - Subtask: Add Appwrite indexes on frequently queried fields (enumeratorId, respondentId, submittedAt)
  - Subtask: Implement pagination for large lists
  - Subtask: Cache statistics for admin dashboard (consider Appwrite Functions for aggregation)
- **Task 3.2.3**: Test API response times
  - Subtask: Measure P95 latency for CRUD operations
  - Subtask: Optimize slow queries (add indexes, reduce payload size)
  - Subtask: Document performance metrics in README

#### Epic 3.3: Security Audit
- **Task 3.3.1**: Review Appwrite permission rules
  - Subtask: Verify all collections have correct role-based permissions
  - Subtask: Test for permission bypass vulnerabilities
  - Subtask: Document permission matrix
- **Task 3.3.2**: Implement password policies
  - Subtask: Enforce minimum 8 characters, complexity rules in Appwrite Auth
  - Subtask: Add password strength indicator to enumerator creation form
  - Subtask: Test password validation
- **Task 3.3.3**: Review data exposure risks
  - Subtask: Verify no PII (names, birthdates) exposed in API responses
  - Subtask: Test GPS coordinate precision (ensure not identifying specific households)
  - Subtask: Document privacy compliance measures

#### Epic 3.4: Observability & Logging
- **Task 3.4.1**: Implement authentication logging
  - Subtask: Log all login attempts (success/failure) with timestamp and userId
  - Subtask: Store logs in Appwrite or external service (consider Sentry)
- **Task 3.4.2**: Implement submission logging
  - Subtask: Log all survey submissions with metadata (responseId, enumeratorId, timestamp)
  - Subtask: Log void actions with reason and admin userId
- **Task 3.4.3**: Integrate error tracking (optional)
  - Subtask: Set up Sentry or similar for client-side error tracking
  - Subtask: Track API errors and network failures
  - Subtask: Create dashboard for error monitoring

#### Epic 3.5: Documentation & Deployment
- **Task 3.5.1**: Update README with deployment instructions
  - Subtask: Document Appwrite project setup steps
  - Subtask: Document environment variables
  - Subtask: Document seed data creation
- **Task 3.5.2**: Write user training materials
  - Subtask: Create enumerator quick-start guide (screenshots)
  - Subtask: Create admin guide for enumerator management
  - Subtask: Create troubleshooting FAQ
- **Task 3.5.3**: Prepare production deployment
  - Subtask: Configure Vercel/Netlify deployment from GitHub
  - Subtask: Set up production Appwrite project (if separate from dev)
  - Subtask: Test production build and deployment
  - Subtask: Document rollback procedures

---

## Dependency Map

### Critical Path (must complete in order):
1. **Phase 0**: Research → **Phase 1**: Data Model → **Epic 2.1**: Auth → **Epic 2.2**: Respondents → **Epic 2.3**: Sessions → **Epic 2.4**: Survey Forms → **Epic 2.5**: Submission → **Phase 3**: Testing

### Parallel Work Streams (can work simultaneously):
- After **Epic 2.1** (Auth): 
  - Epic 2.7 (Admin Dashboard) can start independently
  - Epic 2.2 (Respondents) can start
- After **Epic 2.5** (Submission):
  - Epic 2.6 (Multi-Survey) can start
  - Epic 2.8 (Admin Oversight) can start
  - Epic 2.9 (Export) can start

### Testing Dependencies:
- Unit tests can be written alongside implementation (TDD approach)
- Integration tests (Phase 3) require all epics completed

---

## Success Metrics (mapped to Spec Success Criteria)

### Functionality (SC-001 to SC-010)
- ✅ SC-001: Administrators can create enumerator accounts → **Epic 2.7 Task 2.7.2**
- ✅ SC-002: Enumerators can log in → **Epic 2.1 Task 2.1.2**
- ✅ SC-003: Enumerators can add respondents → **Epic 2.2 Task 2.2.2**
- ✅ SC-004: Respondent codes generated correctly → **Epic 2.2 Task 2.2.1**
- ✅ SC-005: Enumerators can search/select respondents → **Epic 2.2 Task 2.2.4**
- ✅ SC-006: Sessions created correctly → **Epic 2.3 Task 2.3.1**
- ✅ SC-007: Multiple surveys in session → **Epic 2.6**
- ✅ SC-008: GPS captured per submission → **Epic 2.4 Task 2.4.4**
- ✅ SC-009: Validation prevents invalid submission → **Epic 2.4 Task 2.4.3**
- ✅ SC-010: Responses saved correctly → **Epic 2.5 Task 2.5.1**

### Performance (SC-011 to SC-013)
- ✅ SC-011: P95 < 1s form rendering → **Epic 3.2 Task 3.2.1**
- ✅ SC-012: P95 < 300ms API CRUD → **Epic 3.2 Task 3.2.3**
- ✅ SC-013: P95 < 3s dashboard load → **Epic 3.2 Task 3.2.2**

### Reliability (SC-014 to SC-015)
- ✅ SC-014: Retry on network failure → **Epic 2.5 Task 2.5.2**
- ✅ SC-015: Auto-close preserves drafts → **Epic 2.3 Task 2.3.3**

### Security & Privacy (SC-016 to SC-018)
- ✅ SC-016: Role-based access enforced → **Epic 2.1 Task 2.1.3 + Epic 3.3**
- ✅ SC-017: Password policies enforced → **Epic 3.3 Task 3.3.2**
- ✅ SC-018: Audit logging implemented → **Epic 3.4**

### Administrative (SC-019 to SC-020)
- ✅ SC-019: Real-time submission counts → **Epic 2.8 Task 2.8.3**
- ✅ SC-020: Void with reason annotation → **Epic 2.8 Task 2.8.2**

---

## Implementation Sequencing Recommendations

### Week 1: Foundation
- Complete Phase 0 (Research)
- Complete Phase 1 (Data Model, TypeScript contracts)
- Set up Appwrite collections
- Complete Epic 2.1 (Authentication)

### Week 2-3: Core Workflow (P1)
- Epic 2.2 (Respondents)
- Epic 2.3 (Sessions)
- Epic 2.4 (Survey Forms)
- Epic 2.5 (Response Submission)
- **Milestone**: Enumerator can complete one survey (User Story 1)

### Week 4: Extended Workflows (P2)
- Epic 2.6 (Multi-Survey)
- Epic 2.7 (Admin Enumerator Management)
- **Milestone**: Multi-survey workflow + admin can manage enumerators

### Week 5: Admin Features (P2/P3)
- Epic 2.8 (Admin Dashboard Oversight)
- Epic 2.9 (Data Export)
- **Milestone**: Full admin capabilities

### Week 6: Quality & Launch (Phase 3)
- Epic 3.1 (Integration Testing)
- Epic 3.2 (Performance Optimization)
- Epic 3.3 (Security Audit)
- Epic 3.4 (Observability)
- Epic 3.5 (Documentation & Deployment)
- **Milestone**: Production-ready release

---

## Next Steps (After This Plan Approval)

1. **Agent Context Update**: Document technology stack decisions, library choices, and patterns in `.specify/memory/` for future reference
2. **Phase 0 Execution**: Create `research.md` by executing Epic 0.1-0.4 tasks (Appwrite SDK testing, GPS validation, form library evaluation)
3. **Phase 1 Execution**: Create `data-model.md`, TypeScript contracts, and `quickstart.md`
4. **Implementation Kickoff**: Begin Epic 2.1 (Authentication) once Phase 1 deliverables approved
5. **Continuous Testing**: Write tests alongside implementation (TDD approach)

**Approval Required Before Proceeding**: Confirm this plan aligns with Constitution, spec requirements, and stakeholder expectations.
