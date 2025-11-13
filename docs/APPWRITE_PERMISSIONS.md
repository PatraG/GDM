# Appwrite Collections Permissions Documentation

## Overview

This document describes the permission model for all Appwrite collections in the Oral Health Survey application. Permissions are configured to enforce role-based access control (RBAC) between administrators and enumerators.

## Permission Model

Appwrite supports two types of permissions:
1. **Collection-level permissions** - Applied when creating collections
2. **Document-level permissions** - Applied when creating/updating documents

Currently, the automated setup script (`scripts/setup-appwrite.ts`) configures **collection-level permissions**. Additional document-level permissions may be required for fine-grained access control.

## Collection Permissions Summary

### 1. Users Collection
**Purpose**: User account management (admin and enumerator accounts)

**Permissions**:
- `Permission.read(Role.user('admin'))` - Only admins can read user records
- `Permission.create(Role.user('admin'))` - Only admins can create users
- `Permission.update(Role.user('admin'))` - Only admins can update users
- `Permission.delete(Role.user('admin'))` - Only admins can delete users

**Rationale**: User management is admin-only. Enumerators cannot view or modify other users.

---

### 2. Respondents Collection
**Purpose**: Pseudonymized respondent data

**Permissions**:
- `Permission.read(Role.user('admin'))` - Admins can read all respondents
- `Permission.create(Role.user('admin'))` - Currently admin-only (will be updated for enumerators)
- `Permission.update(Role.user('admin'))` - Admin-only updates
- `Permission.delete(Role.user('admin'))` - Admin-only deletion

**Required Updates for Production**:
```typescript
// Enumerators should be able to:
// - Create their own respondents
// - Read their own respondents
// - Update their own respondents (limited fields)

// This requires document-level permissions at creation time:
Permission.read(Role.user(enumeratorId)),
Permission.update(Role.user(enumeratorId))
```

**Compliance**: FR-009, FR-010 (respondent management), FR-044 (admin oversight)

---

### 3. Sessions Collection
**Purpose**: Field visit/encounter tracking

**Permissions**:
- `Permission.read(Role.user('admin'))` - Admins can read all sessions
- `Permission.create(Role.user('admin'))` - Currently admin-only
- `Permission.update(Role.user('admin'))` - Admin-only updates
- `Permission.delete(Role.user('admin'))` - Admin-only deletion

**Required Updates for Production**:
```typescript
// Enumerators should be able to:
// - Create their own sessions
// - Read their own sessions
// - Update their own sessions (close, add metadata)

// Document-level permissions needed
```

**Compliance**: FR-014 (session start), FR-015 (session timeout), FR-045 (admin oversight)

---

### 4. Surveys Collection
**Purpose**: Survey instrument definitions

**Permissions**:
- `Permission.read(Role.any())` - Anyone (including enumerators) can read surveys
- `Permission.create(Role.user('admin'))` - Only admins can create surveys
- `Permission.update(Role.user('admin'))` - Only admins can update surveys
- `Permission.delete(Role.user('admin'))` - Only admins can delete surveys

**Rationale**: Enumerators need read access to display survey forms. Only admins manage survey definitions.

**Compliance**: FR-020 (survey display), FR-043 (versioning), T020a (locking logic)

---

### 5. Questions Collection
**Purpose**: Question definitions within surveys

**Permissions**:
- `Permission.read(Role.any())` - Anyone can read questions
- `Permission.create(Role.user('admin'))` - Admin-only creation
- `Permission.update(Role.user('admin'))` - Admin-only updates
- `Permission.delete(Role.user('admin'))` - Admin-only deletion

**Rationale**: Questions are part of survey instruments, readable by all but manageable only by admins.

**Compliance**: FR-028 (question types), FR-029 (display)

---

### 6. Options Collection
**Purpose**: Answer choices for questions

**Permissions**:
- `Permission.read(Role.any())` - Anyone can read options
- `Permission.create(Role.user('admin'))` - Admin-only creation
- `Permission.update(Role.user('admin'))` - Admin-only updates
- `Permission.delete(Role.user('admin'))` - Admin-only deletion

**Rationale**: Options are part of survey instruments, readable by all.

**Compliance**: FR-028 (question types with options)

---

### 7. Responses Collection
**Purpose**: Completed survey submissions

**Permissions**:
- `Permission.read(Role.user('admin'))` - Admins can read all responses
- `Permission.create(Role.user('admin'))` - Currently admin-only
- `Permission.update(Role.user('admin'))` - Admin-only (for voiding)
- `Permission.delete(Role.user('admin'))` - Admin-only (soft delete via status)

**Required Updates for Production**:
```typescript
// Enumerators should be able to:
// - Create responses in their sessions
// - Read their own responses
// - Update their own draft responses (not submitted ones)

// Document-level permissions:
Permission.read(Role.user(enumeratorId)),
Permission.create(Role.user(enumeratorId)),
Permission.update(Role.user(enumeratorId)) // Only if status=draft
```

**Compliance**: FR-032 (response creation), FR-039 (immutability), FR-040 (admin void), FR-045 (admin oversight)

---

### 8. Answers Collection
**Purpose**: Individual answers to questions

**Permissions**:
- `Permission.read(Role.user('admin'))` - Admins can read all answers
- `Permission.create(Role.user('admin'))` - Currently admin-only
- `Permission.update(Role.user('admin'))` - Admin-only
- `Permission.delete(Role.user('admin'))` - Admin-only

**Required Updates for Production**:
```typescript
// Enumerators should be able to:
// - Create answers with their responses
// - Read their own answers

// Document-level permissions tied to parent response
```

**Compliance**: FR-033 (answer creation), FR-039 (immutability)

---

## Indexes

The following indexes are created for query performance (T026):

### 1. respondents.pseudonym (unique)
```typescript
databases.createIndex(DATABASE_ID, 'respondents', 'pseudonym_unique', 'unique', ['pseudonym'])
```
**Purpose**: Ensure pseudonym uniqueness, fast lookup by respondent code

### 2. sessions.enumeratorId (key)
```typescript
databases.createIndex(DATABASE_ID, 'sessions', 'enumeratorId_index', 'key', ['enumeratorId'])
```
**Purpose**: Fast filtering of sessions by enumerator (for role-based access)

### 3. responses.sessionId (key)
```typescript
databases.createIndex(DATABASE_ID, 'responses', 'sessionId_index', 'key', ['sessionId'])
```
**Purpose**: Fast lookup of all responses in a session

### 4. responses.submittedAt (key)
```typescript
databases.createIndex(DATABASE_ID, 'responses', 'submittedAt_index', 'key', ['submittedAt'])
```
**Purpose**: Time-based filtering for admin dashboard and reports

---

## Implementation Notes

### Current State (MVP)
The automated setup script creates collections with admin-only permissions. This is sufficient for:
- Initial database setup
- Admin console testing
- Development environment

### Production Requirements
For production deployment, implement **document-level permissions** in the application code:

1. **Respondent Creation** (`src/lib/services/respondentService.ts`):
```typescript
await databases.createDocument(
  DATABASE_ID,
  COLLECTIONS.RESPONDENTS,
  ID.unique(),
  data,
  [
    Permission.read(Role.user(enumeratorId)),
    Permission.update(Role.user(enumeratorId)),
    Permission.read(Role.label('admin')),
    Permission.update(Role.label('admin')),
    Permission.delete(Role.label('admin'))
  ]
);
```

2. **Session Creation** (`src/lib/services/sessionService.ts`):
```typescript
await databases.createDocument(
  DATABASE_ID,
  COLLECTIONS.SESSIONS,
  ID.unique(),
  data,
  [
    Permission.read(Role.user(enumeratorId)),
    Permission.update(Role.user(enumeratorId)),
    Permission.read(Role.label('admin')),
    Permission.update(Role.label('admin'))
  ]
);
```

3. **Response Creation** (`src/lib/services/responseService.ts`):
```typescript
await databases.createDocument(
  DATABASE_ID,
  COLLECTIONS.RESPONSES,
  ID.unique(),
  data,
  [
    Permission.read(Role.user(enumeratorId)),
    Permission.update(Role.user(enumeratorId)), // Only for drafts
    Permission.read(Role.label('admin')),
    Permission.update(Role.label('admin')), // For voiding
    Permission.delete(Role.label('admin'))
  ]
);
```

### Role Labels
Appwrite supports user labels for flexible role assignment:
- Assign `admin` label to administrator accounts
- Assign `enumerator` label to field worker accounts
- Use `Role.label('admin')` and `Role.label('enumerator')` in permissions

---

## Security Compliance

This permission model ensures:

✅ **Principle 3: Security & Access Control**
- Enumerators can only access their own data
- Admins have full oversight
- Role-based permissions enforced at database level

✅ **FR-SC-015**: Enumerators see only own respondents/sessions (when document-level permissions are implemented)

✅ **FR-SC-016**: Admins can access all data for oversight and quality control

---

## Next Steps

1. **T020a**: Implement survey version locking logic (application-level validation)
2. **Phase 3+**: Implement document-level permissions in service layers
3. **Testing**: Verify permission enforcement with Playwright tests (Epic 2.1 in plan.md)

---

**Last Updated**: 2025-11-13  
**Script**: `scripts/setup-appwrite.ts`  
**Status**: Collections created ✅, Indexes created ✅, Document-level permissions pending
