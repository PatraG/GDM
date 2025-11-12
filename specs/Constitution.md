# Geospatial Dental Modeler Constitution

**Version**: 1.0.0 | **Ratified**: 2025-11-12 | **Maintained by**: Project Team

---

## Core Principles

### I. Privacy by Design (NON-NEGOTIABLE)

All personal health information MUST be pseudonymized before storage. The application SHALL comply with Indonesia's UU PDP No. 27/2022 (Personal Data Protection Law). Direct identifiers (full names, addresses, NIK) MUST NOT be stored in analytics databases. Consent collection is MANDATORY before any survey data capture. Data retention periods SHALL be documented and enforced through automated purge policies.

**Rationale**: Health data is highly sensitive and legally protected. Privacy violations carry severe legal and ethical consequences. Pseudonymization enables spatial and statistical analysis while protecting individual identity.

### II. Reliability & Performance Standards

API response times MUST meet P95 < 300 ms under normal load. Autosave operations SHALL complete within 1 second to prevent data loss during field surveys. The system MUST implement offline-first architecture for enumerator workflows to ensure functionality in areas with unstable connectivity. Recovery from transient failures SHALL be automatic without user intervention.

**Rationale**: Field enumerators work in diverse environments with varying connectivity. Survey data loss is unacceptable. Performance degradation impacts productivity and data quality.

### III. Technical Stack Consistency

Backend services SHALL be built exclusively on Appwrite Cloud (database, authentication, serverless functions). Frontend applications MUST use Next.js 14+ App Router with TypeScript, Tailwind CSS, and shadcn/ui components. State management SHALL follow React Server Components patterns where possible. All code MUST pass TypeScript strict mode compilation without suppressions.

**Rationale**: Technology homogeneity reduces cognitive load, simplifies maintenance, and ensures team members can work across all modules. The selected stack provides enterprise-grade scalability and developer experience.

### IV. Data Integrity & Validation

All user inputs MUST be validated on both client and server sides. Database schemas SHALL enforce referential integrity through foreign key constraints. Survey responses MUST be validated against question types and option constraints before persistence. Data migrations MUST be reversible and tested against production-scale datasets.

**Rationale**: Data quality is paramount for medical research and public health decision-making. Invalid or corrupted data undermines the entire application's value proposition.

### V. Role-Based Access Control (RBAC)

The system SHALL enforce exactly two user roles: Administrator and Enumerator. Administrators have full read/write access to all data and system configuration. Enumerators can create respondents, initiate sessions, and submit survey responses only. Access control MUST be enforced at the API layer, not just UI layer. Session tokens SHALL expire after 24 hours of inactivity.

**Rationale**: Clear role separation prevents unauthorized data access and modification. Defense in depth requires server-side enforcement regardless of client-side controls.

---

## Module Structure

| Module                | Purpose                                           | Key Entities                          |
|-----------------------|---------------------------------------------------|---------------------------------------|
| **Authentication**    | User identity & session management                | users, sessions                       |
| **Respondent Mgmt**   | Register and track survey participants            | respondents                           |
| **Survey Engine**     | Manage survey definitions & question flows        | surveys, questions, options           |
| **Response Capture**  | Collect and store survey answers                  | visits, responses, answers            |
| **Analytics**         | Aggregate data for spatial & statistical views    | (derived from responses + respondents)|
| **Admin Dashboard**   | Visualization & reporting for administrators      | (aggregates all entities)             |

---

## Backend Standards

### Appwrite Configuration Conventions

- **Database ID**: `production` (or `dev` for non-production environments)
- **Collection Naming**: Singular nouns in camelCase (e.g., `respondent`, `surveyResponse`)
- **Attribute Naming**: camelCase for all fields; use `createdAt` and `updatedAt` timestamps on all collections
- **Indexes**: Create compound indexes for common query patterns (e.g., `respondentId + createdAt` DESC)
- **Functions**: One function per business operation; deploy via Appwrite CLI; use environment variables for secrets

### Environment Variables

All sensitive configuration MUST be stored as Appwrite environment variables or project secrets. Required keys:

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY` (server-side only)
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` (client-safe)
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` (client-safe)

### API Design Rules

- All mutations return the created/updated document plus metadata
- List endpoints support pagination (`limit`, `offset`) and filtering
- Error responses follow RFC 7807 Problem Details format
- Use HTTP status codes correctly: 200 (success), 201 (created), 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 500 (server error)

---

## Frontend Baseline

### UI Technology Stack

- **Framework**: Next.js 14+ (App Router, React Server Components)
- **Language**: TypeScript 5+ (strict mode enabled)
- **Styling**: Tailwind CSS 3+ with project-specific design tokens
- **Component Library**: shadcn/ui (installed components live in `/components/ui`)
- **Forms**: React Hook Form + Zod for schema validation
- **State**: React Context for global state; URL search params for filters

### Offline-First Rule (NON-NEGOTIABLE)

Survey forms MUST function without network connectivity. Use IndexedDB or localStorage for pending submissions. Implement background sync to upload when connectivity resumes. Display sync status prominently in enumerator UI. Conflict resolution SHALL prioritize the most recent timestamp.

**Rationale**: Field surveys cannot depend on real-time connectivity. Data loss due to network issues is unacceptable.

### Validation Standards

- All form inputs MUST have Zod schemas defining allowed values
- Client-side validation provides immediate feedback; server-side validation is authoritative
- Display validation errors inline adjacent to the field
- Disable submit buttons until all required fields are valid

---

## Data Governance & Privacy Rules

### Pseudonymization Protocol

1. **Respondent ID Generation**: Use UUID v4 for all respondent identifiers
2. **Prohibited Fields**: Do NOT store full legal names, complete addresses, or national ID numbers (NIK) in analytical databases
3. **Linkage File**: Maintain a separate, access-controlled collection mapping pseudonymized IDs to real identities for legal compliance (accessible only to designated administrators)
4. **Geospatial Data**: Store location data at kelurahan (village) level or coarser; do NOT store exact GPS coordinates unless explicitly required and consented

### Consent Management

- Informed consent MUST be collected and stored before the first survey
- Consent records SHALL include: timestamp, enumerator ID, consent type (e.g., data collection, research use)
- Respondents have the right to withdraw consent; withdrawal triggers data pseudonymization or deletion per UU PDP requirements
- Display consent summary in plain Indonesian language (Bahasa Indonesia) at the survey start

### Data Retention & Deletion

- Active survey data: Retained indefinitely while respondent participates
- Post-study retention: Anonymized data may be kept for research; identifiable data MUST be purged within 90 days of study conclusion unless legally required otherwise
- Deletion requests: MUST be honored within 30 days per UU PDP Article 32
- Audit logs: Retain access logs for 1 year minimum for compliance verification

### Access Control & Audit

- Database access limited to authenticated application services and designated DBAs
- All data access MUST be logged with user ID, timestamp, operation type
- Quarterly access reviews conducted by administrators
- Anomalous access patterns trigger alerts

---

## Versioning & Ratification Rules

### Constitution Versioning

This document follows **semantic versioning** (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward-incompatible governance changes (e.g., removing a core principle, changing RBAC structure)
- **MINOR**: New principles or sections added; material expansions to existing rules
- **PATCH**: Clarifications, typo fixes, formatting improvements with no semantic changes

### Amendment Procedure

1. **Proposal**: Any team member may propose an amendment via a Pull Request
2. **Review**: All technical leads must review and approve
3. **Migration Plan**: Breaking changes (MAJOR bumps) require a migration plan and timeline
4. **Ratification**: Merge to `main` branch constitutes ratification; update **Last Amended** date
5. **Notification**: All team members MUST be notified of MAJOR or MINOR changes

### Compliance Verification

- All Pull Requests MUST include a constitutional compliance checklist
- Code reviews SHALL verify adherence to core principles
- Quarterly audits assess actual vs. documented practices; discrepancies trigger constitution or code updates
- Violations of NON-NEGOTIABLE principles block merge until resolved

---

## Development Workflow Integration

### Specification Governance

This project uses **spec-kit** for managing specifications. All features MUST:

1. Have a corresponding specification document in `/specs/features/`
2. Link tasks to specifications via plan documents
3. Update specifications when implementation reveals requirement gaps

### AI Assistant Guidelines

- **GitHub Copilot**: Used for code generation, refactoring, and test authoring
- **Constitution Compliance**: AI-generated code MUST be reviewed for constitutional adherence (especially privacy and validation rules)
- AI suggestions that violate core principles SHALL be rejected regardless of convenience

### Quality Gates

- Unit test coverage: Minimum 80% for business logic
- Integration tests: Required for all API endpoints and cross-module workflows
- Type safety: Zero TypeScript errors or warnings
- Accessibility: WCAG 2.1 AA compliance for all interactive UI elements

---

**Version**: 1.0.0 | **Ratified**: 2025-11-12 | **Last Amended**: 2025-11-12

---

*This constitution is the authoritative governance document for the Geospatial Dental Modeler project. All code, documentation, and processes MUST align with these principles. Deviations require formal amendment.*
