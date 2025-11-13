# Project Constitution: Oral Health Survey Web Application

<!--
Sync Impact Report:
Version: 1.0.0 (Initial ratification)
Modified Principles: N/A (Initial version)
Added Sections: All (Initial version)
Removed Sections: None
Templates Status: N/A (Initial Constitution)
Follow-up TODOs: None
-->

**Version:** 1.0.0  
**Ratification Date:** 2025-11-13  
**Last Amended:** 2025-11-13  
**Owner:** Wingghayarie Patra Gandhi  
**Repository:** GDM (Geospasial Dental Modeler)

---

## 1. Project Overview

### 1.1 Project Name and Purpose

**Project Name:** Oral Health Survey Web Application (Geospasial Dental Modeler)

**Purpose:** A web-based platform for conducting systematic oral health surveys in the field, enabling data collection, spatial analysis, and comprehensive reporting for dental and oral health research and public health initiatives.

**Primary Users:**
- **Administrator:** Manages enumerators, surveys, dashboard analytics, and spatial visualizations.
- **Enumerator:** Field worker who authenticates, registers respondents, and conducts surveys.

### 1.2 Governance Baseline

This Constitution serves as the **authoritative governance document** for the Oral Health Survey Web Application project. All feature specifications, architectural decisions, code contributions, and deployment configurations MUST align with the principles, standards, and constraints defined herein.

---

## 2. Core Principles

The following principles are **non-negotiable** and MUST guide all development, deployment, and operational decisions.

### Principle 1: Data Privacy and Compliance (UU PDP)

**Declaration:**  
All personal data collection, processing, and storage MUST comply with Indonesian Personal Data Protection Law (UU PDP No. 27 Tahun 2022). Privacy is a foundational right, not an optional feature.

**Requirements:**
- Respondent data MUST be pseudonymized; full names MUST NOT be stored unless legally required and justified.
- Collect only the minimum necessary demographic data (age ranges, not exact birthdates).
- Explicit consent MUST be recorded and stored per respondent before any survey data collection.
- Location data (GPS coordinates) MUST be stored with privacy safeguards (hashed identifiers, aggregated for public reporting).
- Data retention policies MUST be defined and enforced; archival and purging procedures MUST be documented.
- Access controls MUST ensure enumerators see only assigned data; administrators have full dataset access with audit trails.

**Rationale:**  
Indonesia's PDP Law mandates accountability for personal data processing. Non-compliance risks legal penalties and erosion of public trust in health surveys.

### Principle 2: Reliability and Data Integrity

**Declaration:**  
Survey data MUST be accurate, immutable once submitted, and traceable to source.

**Requirements:**
- Submitted survey responses MUST NOT be deleted; use status flags (e.g., `archived`, `invalidated`) for lifecycle management.
- Survey definitions (questions, options) MUST be versioned; each response MUST reference the exact survey version used during data collection.
- All data mutations MUST be logged with timestamps, user identifiers, and action types.
- System MUST provide mechanisms to detect and flag duplicate or anomalous entries.

**Rationale:**  
Research data integrity is critical for valid analysis. Immutability ensures audit trails and prevents accidental or malicious data loss.

### Principle 3: Security-First Architecture

**Declaration:**  
Security MUST be embedded in every layer: authentication, authorization, data transmission, and storage.

**Requirements:**
- Authentication MUST use Appwrite Auth with secure password policies (minimum 8 characters, complexity rules).
- Authorization MUST enforce role-based access control (RBAC): admin vs. enumerator with least-privilege principle.
- All API communications MUST use HTTPS/TLS.
- Sensitive configuration (API keys, database credentials) MUST NEVER be hard-coded; use environment variables and secret management.
- Regular security audits and dependency vulnerability scans MUST be performed.

**Rationale:**  
Health data is sensitive. Security breaches compromise privacy, regulatory compliance, and organizational reputation.

### Principle 4: Maintainability and Code Quality

**Declaration:**  
Codebase MUST be readable, testable, and evolvable by current and future developers.

**Requirements:**
- TypeScript MUST be used for all frontend and backend code (where applicable).
- ESLint and Prettier MUST be enforced via pre-commit hooks and CI/CD pipelines.
- Code reviews MUST be mandatory for all pull requests.
- Critical business logic MUST have unit tests (minimum 80% coverage for core modules).
- Documentation MUST be kept in sync with code (README, inline comments, API docs).

**Rationale:**  
Maintainability reduces technical debt, accelerates feature development, and ensures long-term project viability.

### Principle 5: Backend-as-a-Service Commitment (Appwrite Cloud)

**Declaration:**  
Appwrite Cloud is the **single source of truth** for backend services: databases, authentication, storage, and serverless functions.

**Requirements:**
- All persistent data MUST reside in Appwrite Databases.
- User authentication MUST use Appwrite Auth.
- File uploads (e.g., consent forms, attachments) MUST use Appwrite Storage.
- Business logic requiring server-side execution MUST use Appwrite Functions.
- No alternative backend technologies (e.g., custom Node.js/Express servers) MAY be introduced without formal Constitution amendment.

**Rationale:**  
Standardizing on Appwrite Cloud reduces operational complexity, leverages managed infrastructure, and aligns with the starter template baseline.

### Principle 6: Observability and Monitoring

**Declaration:**  
System behavior MUST be observable via logging, metrics, and tracing to enable proactive issue detection and performance optimization.

**Requirements:**
- Application MUST log critical events: authentication attempts, survey submissions, errors, and data access.
- Performance metrics MUST be tracked: API response times (P95 < 300ms), survey rendering times (P95 < 1s).
- Error tracking MUST be integrated (e.g., Sentry or equivalent).
- Dashboards MUST provide real-time visibility into system health and usage patterns.

**Rationale:**  
Observability enables rapid incident response, performance tuning, and evidence-based capacity planning.

### Principle 7: Progressive Enhancement and Offline Readiness

**Declaration:**  
While the MVP prioritizes online functionality, the architecture MUST support future offline-first capabilities via Progressive Web App (PWA) standards.

**Requirements:**
- Frontend MUST be designed to degrade gracefully when connectivity is limited.
- Local storage and service workers MAY be introduced in future iterations to queue survey submissions.
- Sync conflict resolution strategies MUST be documented before offline mode implementation.

**Rationale:**  
Field surveys often occur in areas with unreliable internet. Offline capability ensures data collection continuity.

---

## 3. System Modules

The system is decomposed into the following high-level modules. Each module MUST align with the principles above.

| Module Name                  | Purpose                                                                 | Core Entities                              | Responsibilities                                                                 |
|------------------------------|-------------------------------------------------------------------------|--------------------------------------------|----------------------------------------------------------------------------------|
| **Auth & Roles**             | User authentication and role-based authorization                        | Users, Roles, Sessions                     | Login/logout, role assignment (admin/enumerator), session management             |
| **Respondent Registry**      | Manage respondent profiles and consent                                  | Respondents, Consent Records               | Create/search respondents, record consent, pseudonymization                      |
| **Session & Visit Tracking** | Track field visits and associate them with respondents and locations    | Sessions, Visits, Locations                | Start/end session, log GPS coordinates, link visits to respondents               |
| **Survey Engine**            | Define surveys, questions, response options, and collect answers        | Surveys, Questions, Options, Responses     | Survey versioning, question rendering, answer validation, response submission    |
| **Analytics & Spatial Reporting** | Generate insights via dashboards, maps, charts, and data exports   | Reports, Visualizations, Exports           | Filter by time/location/enumerator, map-based visualizations, export to CSV/JSON |

---

## 4. Data & Backend Standards

### 4.1 Backend Platform

**Appwrite Cloud** is the authoritative backend. All data persistence, authentication, and business logic execution MUST occur within Appwrite services.

**Canonical Database Name:** `oral_health_survey`

### 4.2 Naming Conventions

- **Collections:** `lower_snake_case` (e.g., `respondents`, `survey_responses`)
- **Attributes (Fields):** `camelCase` (e.g., `createdAt`, `respondentId`, `questionText`)
- **Document IDs:** Appwrite auto-generated UUIDs MUST be used unless a specific business identifier is required (e.g., respondent pseudonym).

### 4.3 Core Collections

The following collections MUST exist in the `oral_health_survey` database:

| Collection Name       | Purpose                                                                 | Key Attributes (Examples)                              |
|-----------------------|-------------------------------------------------------------------------|--------------------------------------------------------|
| `users`               | Extended user metadata beyond Appwrite Accounts (e.g., role, status)   | `userId`, `role`, `status`, `createdAt`                |
| `respondents`         | Pseudonymized respondent profiles                                       | `respondentId`, `pseudonym`, `ageRange`, `consentGiven`, `createdAt` |
| `surveys`             | Survey definitions (questions, metadata, versioning)                    | `surveyId`, `title`, `version`, `questions`, `status`, `createdAt` |
| `questions`           | Individual survey questions (linked to surveys)                         | `questionId`, `surveyId`, `questionText`, `questionType`, `order` |
| `options`             | Response options for multiple-choice questions                          | `optionId`, `questionId`, `optionText`, `value`        |
| `sessions`            | Field session metadata (enumerator assignment, time range)              | `sessionId`, `enumeratorId`, `startTime`, `endTime`, `status` |
| `visits`              | Individual respondent visits within a session (includes GPS)            | `visitId`, `sessionId`, `respondentId`, `location`, `timestamp` |
| `responses`           | Survey response records (one per survey per visit)                      | `responseId`, `visitId`, `surveyId`, `surveyVersion`, `submittedAt`, `status` |
| `answers`             | Individual answers to questions within a response                       | `answerId`, `responseId`, `questionId`, `answerValue`, `createdAt` |

### 4.4 Data Access Control

**Permissions MUST follow these rules:**

- **Unauthenticated Users:** No read/write access to any collection.
- **Enumerators:**
  - **Read:** Own sessions, visits, responses, and related respondents.
  - **Write:** Create respondents, sessions, visits, responses, answers (scoped to own assignments).
  - **No access** to other enumerators' data or admin-only analytics.
- **Administrators:**
  - **Read/Write:** Full access to all collections.
  - **Delete:** Soft delete only (status flags); hard deletes require manual database intervention and audit trail.

**Implementation:** Use Appwrite's permission model with role-based rules (`role:enumerator`, `role:admin`).

### 4.5 Immutability and Versioning

- **Survey Versioning:** Each survey MUST have a `version` field. When questions/options are modified, a new version MUST be created. Responses MUST reference `surveyVersion` to ensure reproducibility.
- **Response Immutability:** Once a response status is `submitted`, the `answers` collection records MUST NOT be updated or deleted. Use status flags (`active`, `archived`, `invalidated`) for lifecycle management.
- **Audit Logging:** All mutations to `responses`, `answers`, and `respondents` MUST log: `timestamp`, `userId`, `action`, `previousValue`, `newValue`.

---

## 5. Frontend Baseline

### 5.1 Technology Stack

The frontend is based on the **Appwrite Next.js Starter** and MUST adhere to the following standards:

- **Framework:** Next.js (App Router) v15+
- **Language:** TypeScript (strict mode enabled)
- **Styling:** Tailwind CSS with shadcn/ui components (allowed and encouraged)
- **State Management:** React hooks and context; external state libraries (e.g., Zustand, Redux) MAY be introduced if justified.

### 5.2 UI/UX Expectations

**Enumerator Workflow Optimization:**
- **Speed:** Survey selection and rendering MUST complete in < 1s (P95) after data fetch.
- **Flow:** Search/add respondent → start session → select survey → fill → submit → next survey (seamless transitions).
- **Error Handling:** Clear, actionable error messages with retry mechanisms.

**Admin Dashboard:**
- **Filters:** Time range, location (admin area, GPS bounds), enumerator, survey type.
- **Visualizations:** Map-based heatmaps, bar/line charts for trends, tabular data exports (CSV, JSON).
- **Performance:** Dashboard load time < 3s (P95).

### 5.3 Code Quality Standards

- **TypeScript:** All `.ts` and `.tsx` files MUST pass strict type checking (`tsc --noEmit`).
- **Linting:** ESLint MUST be configured and enforced via pre-commit hooks.
- **Formatting:** Prettier MUST auto-format on save and pre-commit.
- **Testing:** Critical user flows (login, survey submission) MUST have integration tests (e.g., Playwright, Cypress).

### 5.4 Offline-First and PWA

- **Current State:** MVP is online-only.
- **Future Requirement:** Architecture MUST support PWA conversion (service workers, manifest.json, local IndexedDB queue).
- **Design Constraint:** Data models and API contracts MUST anticipate eventual sync conflict resolution (optimistic updates, version vectors).

---

## 6. Privacy, Security, and Compliance

### 6.1 Regulatory Framework

**UU PDP No. 27 Tahun 2022 (Indonesian Personal Data Protection Law)** is the guiding regulation. All data handling MUST comply with its requirements:

1. **Lawfulness and Consent:** Explicit consent MUST be obtained and recorded before data collection.
2. **Data Minimization:** Collect only necessary data (age ranges, pseudonyms, no full names/birthdates unless justified).
3. **Purpose Limitation:** Data MUST be used only for stated survey purposes; secondary uses require additional consent.
4. **Transparency:** Respondents MUST be informed of data collection purposes, retention periods, and rights (access, correction, deletion).
5. **Security:** Technical and organizational measures MUST protect data from unauthorized access, loss, or alteration.
6. **Accountability:** Data controllers (administrators) MUST maintain records of processing activities and compliance evidence.

### 6.2 Pseudonymization and Anonymization

- **Respondent Identifiers:** Use pseudonyms or hashed IDs. Full names MUST NOT be stored unless legally required (e.g., explicit consent for research publication).
- **Location Data:** GPS coordinates MUST be stored with precision limits (e.g., 100m radius for public reporting). Exact coordinates available only to authorized administrators.
- **IP Addresses:** If logged, MUST be hashed or truncated.

### 6.3 Consent Management

- **Explicit Consent:** Before first survey, enumerator MUST record consent via a dedicated UI (checkbox + timestamp).
- **Consent Record:** Stored in `respondents.consentGiven` (boolean) and `respondents.consentTimestamp` (ISO 8601).
- **Revocation:** Respondents MAY revoke consent; system MUST flag data as `consentRevoked` and exclude from future analysis (soft delete).

### 6.4 Data Retention and Purging

- **Retention Period:** Survey data MUST be retained for a minimum of 5 years (research standard) unless respondent revokes consent.
- **Archival:** After retention period, data MUST be archived (read-only, encrypted backups) or purged (irreversible deletion).
- **Purge Logs:** All purges MUST be logged with: date, user, reason, data scope.

### 6.5 Access Control and Audit Trails

- **Role-Based Access:** As defined in Section 4.4.
- **Audit Logs:** All access to `respondents`, `responses`, `answers` MUST be logged: `timestamp`, `userId`, `action` (read/write/delete), `resourceId`.
- **Log Retention:** Audit logs MUST be retained for 7 years (legal requirement).

---

## 7. Governance & Versioning

### 7.1 Constitution Versioning

This Constitution follows **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

- **MAJOR:** Backward-incompatible changes (e.g., removal of core principles, fundamental architecture shifts).
- **MINOR:** New principles, sections, or material expansions (e.g., new module definitions, additional compliance requirements).
- **PATCH:** Clarifications, wording fixes, non-semantic refinements.

### 7.2 Amendment Process

1. **Proposal:** Any team member MAY propose an amendment via pull request to `specs/Constitution.md`.
2. **Review:** Owner (Wingghayarie Patra Gandhi) and stakeholders MUST review and discuss.
3. **Approval:** Owner MUST approve before merge.
4. **Propagation:** After amendment, dependent artifacts (feature specs, templates, CI/CD configs) MUST be updated to reflect changes.
5. **Communication:** Amended Constitution MUST be announced to all team members with summary of changes.

### 7.3 Relation to Feature Specifications

- **Conformance:** All feature specifications under `specs/features/` MUST conform to this Constitution.
- **Precedence:** In case of conflict, Constitution takes precedence; feature specs MUST be revised.
- **Cross-Reference:** Feature specs SHOULD reference relevant Constitution sections (e.g., "This feature complies with Principle 1: Data Privacy").

### 7.4 CI/CD and Environment Configuration

- **No Hard-Coded Secrets:** API keys, Appwrite endpoints, database credentials MUST be stored in environment variables (`.env` files, CI/CD secret stores).
- **Environment Separation:** Development, staging, and production environments MUST be isolated with separate Appwrite projects and databases.
- **Deployment Gates:** Production deployments MUST pass: linting, type checking, unit tests, integration tests, security scans.

---

## 8. Version History

| Version | Date       | Author/Owner                | Changes                          |
|---------|------------|-----------------------------|----------------------------------|
| 1.0.0   | 2025-11-13 | Wingghayarie Patra Gandhi   | Initial ratification             |

---

## 9. Conclusion

This Constitution establishes the **foundational governance framework** for the Oral Health Survey Web Application. All contributors, maintainers, and stakeholders MUST adhere to the principles, standards, and processes defined herein. Regular reviews (at least annually) MUST be conducted to ensure the Constitution remains aligned with project evolution, regulatory changes, and technological advancements.

**For questions or amendment proposals, contact:** Wingghayarie Patra Gandhi (Project Owner)

---

**End of Constitution**
