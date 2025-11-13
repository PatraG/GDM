# Setup Scripts

## Appwrite Database Setup

Script otomatis untuk membuat database dan collections Appwrite untuk aplikasi Oral Health Survey.

### Prerequisites

1. Pastikan file `.env` sudah dikonfigurasi dengan credentials Appwrite:
   ```env
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
   APPWRITE_API_KEY=your_server_api_key
   ```

2. API Key harus memiliki permissions berikut:
   - `databases.write`
   - `collections.write`
   - `attributes.write`
   - `indexes.write`

### Usage

```bash
npm run setup:appwrite
```

### What This Script Does

1. **Creates Database**: `oral_health_survey`

2. **Creates 8 Collections**:
   - `users` - User accounts dengan role-based access
   - `respondents` - Data responden survei
   - `sessions` - Session enumerator
   - `surveys` - Master data survei
   - `questions` - Pertanyaan survei
   - `options` - Pilihan jawaban
   - `responses` - Response submission
   - `answers` - Individual answers

3. **Configures Attributes**: Setiap collection dengan schema lengkap (string, enum, boolean, integer, datetime)

4. **Sets Permissions**: Role-based permissions (admin, enumerator)

5. **Creates Indexes**: 
   - `respondents.pseudonym` (unique)
   - `sessions.enumeratorId` (key)
   - `responses.sessionId` (key)
   - `responses.submittedAt` (key)

### Troubleshooting

**Error: "Collection already exists"**
- Script akan skip collection yang sudah ada
- Tidak akan menghapus data yang ada

**Error: "Invalid API Key"**
- Verifikasi API key di Appwrite Console
- Pastikan API key memiliki scope yang cukup

**Error: "Cannot set default value for required attribute"**
- Ini sudah diperbaiki di script
- Attribute yang required tidak boleh punya default value

### Idempotency

Script ini **idempotent** - aman untuk dijalankan berkali-kali:
- Database yang sudah ada akan di-skip
- Collection yang sudah ada akan di-skip
- Tidak akan menghapus atau mengubah data yang ada

### Next Steps After Setup

1. Verifikasi collections di Appwrite Console
2. Create initial admin user via Appwrite Console
3. Test connection dengan `npm run dev`
