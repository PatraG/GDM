# Appwrite Setup - Automated

## Overview

Setup Appwrite database dan collections secara otomatis menggunakan Appwrite SDK dengan API key yang sudah dikonfigurasi di `.env`.

**API Credentials**:

- Project ID: `691351eb00227fd3a6ea`
- Endpoint: `https://sgp.cloud.appwrite.io/v1`
- API Key: Configured in `.env` (APPWRITE_API_KEY)

---

## Automated Setup Script

### 1. Setup Database & Collections

Jalankan script berikut untuk membuat database `oral_health_survey` dan semua collections yang diperlukan:

```bash
npm run setup:appwrite
```

Script ini akan:

1. Membuat database `oral_health_survey`
2. Membuat 9 collections (users, respondents, sessions, surveys, questions, options, responses, answers, visits)
3. Mengkonfigurasi permissions untuk role:admin dan role:enumerator
4. Membuat indexes yang diperlukan

### 2. Manual Verification (Optional)

Setelah script selesai, verifikasi di Appwrite Console:

1. Buka: https://cloud.appwrite.io
2. Pilih project: "Geospasial Dental Modeler"
3. Navigate ke Databases → oral_health_survey
4. Pastikan semua 9 collections sudah ada

---

## Collections Schema

Script akan membuat collections berikut:

### 1. users

- userId (string, required)
- email (string, required)
- role (enum: admin|enumerator, required)
- status (enum: active|suspended, required)
- createdAt (datetime, required)
- updatedAt (datetime, required)

### 2. respondents

- respondentId (string, auto-generated)
- pseudonym (string, unique, e.g., "R-00001")
- ageRange (enum: 18-24|25-34|35-44|45-54|55-64|65+)
- sex (enum: M|F|Other)
- adminArea (string)
- consentGiven (boolean, required)
- consentTimestamp (datetime)
- enumeratorId (string, required)
- createdAt (datetime, required)

### 3. sessions

- sessionId (string, auto-generated)
- respondentId (string, required)
- enumeratorId (string, required)
- startTime (datetime, required)
- endTime (datetime, optional)
- status (enum: open|closed|timeout)
- createdAt (datetime, required)
- updatedAt (datetime, required)

### 4. surveys

- surveyId (string, auto-generated)
- title (string, required)
- description (string)
- version (string, required, e.g., "1.0.0")
- status (enum: draft|locked|archived)
- createdAt (datetime, required)
- updatedAt (datetime, required)

### 5. questions

- questionId (string, auto-generated)
- surveyId (string, required)
- questionText (string, required)
- questionType (enum: text|radio|checkbox|scale)
- required (boolean, default: false)
- order (integer, required)
- createdAt (datetime, required)

### 6. options

- optionId (string, auto-generated)
- questionId (string, required)
- optionText (string, required)
- value (string, required)
- order (integer, required)

### 7. responses

- responseId (string, auto-generated)
- sessionId (string, required)
- respondentId (string, required)
- surveyId (string, required)
- surveyVersion (string, required)
- location (object: {lat: number, lng: number})
- status (enum: draft|submitted|voided)
- submittedAt (datetime)
- voidedBy (string, optional)
- voidReason (string, optional)
- createdAt (datetime, required)
- updatedAt (datetime, required)

### 8. answers

- answerId (string, auto-generated)
- responseId (string, required)
- questionId (string, required)
- answerValue (string, required)
- createdAt (datetime, required)

### 9. visits (for future use)

- visitId (string, auto-generated)
- sessionId (string, required)
- respondentId (string, required)
- location (object: {lat: number, lng: number})
- timestamp (datetime, required)

---

## Permissions Configuration

**Admin Role** (`role:admin`):

- Full CRUD access to all collections
- Can create, read, update, delete any document

**Enumerator Role** (`role:enumerator`):

- **users**: Read own document only
- **respondents**: CRUD own respondents (where enumeratorId matches)
- **sessions**: CRUD own sessions (where enumeratorId matches)
- **surveys, questions, options**: Read only
- **responses, answers**: CRUD own responses (where enumeratorId matches)

---

## Indexes

Script akan membuat indexes berikut untuk optimasi query:

1. **respondents.pseudonym**: Unique index untuk mencegah duplikasi kode respondent
2. **sessions.enumeratorId**: Index untuk query sessions by enumerator
3. **responses.sessionId**: Index untuk query responses by session
4. **responses.submittedAt**: Index untuk filtering by submission date

---

## Troubleshooting

### Error: Database already exists

Jika database sudah ada, script akan skip dan langsung membuat collections yang belum ada.

### Error: Permission denied

Pastikan APPWRITE_API_KEY di `.env` memiliki permission yang cukup (Server API Key dengan scope databases.write).

### Error: Invalid attribute type

Pastikan Appwrite version mendukung semua tipe data yang digunakan (string, integer, boolean, datetime, enum).

---

**Created**: 2025-11-13  
**Phase**: 1 - Setup  
**Status**: Automated setup available via npm script
