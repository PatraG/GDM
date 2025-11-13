# Custom Domain Setup Guide

## Option 1: Using Existing Domain

### Prerequisites
- Domain yang sudah Anda miliki (contoh: `yourdomain.com`)
- Akses ke DNS management provider domain Anda

### Step 1: Add Domain to Vercel

#### Via CLI:
```bash
# Format: vercel domains add <domain> <project-name>
vercel domains add dental-survey.yourdomain.com geospasial-dental-modeler

# Atau untuk root domain:
vercel domains add yourdomain.com geospasial-dental-modeler
```

#### Via Dashboard:
1. Buka: https://vercel.com/patrags-projects/geospasial-dental-modeler/settings/domains
2. Klik **"Add"**
3. Masukkan domain Anda (contoh: `dental.yourdomain.com`)
4. Klik **"Add"**

### Step 2: Configure DNS Records

Vercel akan memberikan DNS records yang perlu Anda tambahkan. Ada 2 tipe:

#### A. Subdomain (Recommended - Lebih Mudah)
Contoh: `dental.yourdomain.com`

**DNS Record Type: CNAME**
```
Name:  dental
Type:  CNAME
Value: cname.vercel-dns.com
TTL:   3600 (or Auto)
```

#### B. Root Domain (Advanced)
Contoh: `yourdomain.com`

**DNS Record Type: A Records**
```
Name:  @
Type:  A
Value: 76.76.21.21
TTL:   3600

Name:  @
Type:  A
Value: 76.76.21.241
TTL:   3600
```

**Plus CNAME untuk www:**
```
Name:  www
Type:  CNAME
Value: cname.vercel-dns.com
TTL:   3600
```

### Step 3: Add DNS Records at Your Provider

#### Namecheap:
1. Login ke Namecheap
2. Dashboard → Domain List → Manage
3. Advanced DNS → Add New Record
4. Masukkan CNAME/A record dari Step 2
5. Save

#### Cloudflare:
1. Login ke Cloudflare
2. Select your domain
3. DNS → Add Record
4. Masukkan CNAME/A record dari Step 2
5. **PENTING**: Set Proxy status to **DNS Only** (gray cloud) ⚠️
6. Save

#### GoDaddy:
1. Login ke GoDaddy
2. My Products → DNS
3. Add → CNAME/A Record
4. Masukkan values dari Step 2
5. Save

#### Niagahoster / IDCloudHost:
1. Login ke control panel
2. Domain → Manage DNS
3. Add Record
4. Masukkan CNAME/A record
5. Save

### Step 4: Wait for DNS Propagation

- **Subdomain (CNAME)**: 5-10 menit
- **Root domain (A)**: 30-60 menit
- **Global propagation**: Up to 48 jam (biasanya < 2 jam)

Check status:
```bash
# Check DNS propagation
nslookup dental.yourdomain.com

# Or use online tool
https://dnschecker.org
```

### Step 5: Verify in Vercel

```bash
# Check domain status
vercel domains ls

# Inspect specific domain
vercel domains inspect dental.yourdomain.com
```

Atau via dashboard:
https://vercel.com/patrags-projects/geospasial-dental-modeler/settings/domains

Status akan berubah dari "Pending" → "Valid" ketika siap.

---

## Option 2: Buy New Domain

### Recommended Registrars:

#### 1. Namecheap (Recommended - Affordable)
- URL: https://www.namecheap.com
- Price: ~$10-15/year
- Pros: Cheap, good support, free WHOIS privacy
- Cons: None significant

#### 2. Cloudflare (Best for Developers)
- URL: https://www.cloudflare.com/products/registrar/
- Price: At-cost pricing (~$8-9/year)
- Pros: Best price, automatic DNS, DDoS protection
- Cons: Requires Cloudflare account setup

#### 3. GoDaddy
- URL: https://www.godaddy.com
- Price: ~$12-20/year
- Pros: Well-known, many TLDs
- Cons: More expensive, upsell attempts

#### 4. Niagahoster (Indonesia)
- URL: https://www.niagahoster.co.id
- Price: ~Rp 150.000/year
- Pros: Local support, Indonesian language
- Cons: Limited international support

### Steps to Buy:

1. **Choose domain name**
   ```
   Suggestions for dental survey:
   - dental-survey.com
   - oral-health-survey.com
   - geospasial-dental.com
   - survey-gigi.com (Indonesian)
   - kesehatan-gigi.com
   ```

2. **Search availability** at chosen registrar

3. **Purchase domain** (~$10-15/year)

4. **Follow Option 1 steps above** to configure DNS

---

## Option 3: Free Subdomain from Vercel

Anda sudah punya:
```
https://geospasial-dental-modeler-kpmu7md29-patrags-projects.vercel.app
```

Tapi Anda bisa request custom `.vercel.app` subdomain:

```bash
vercel alias set geospasial-dental-modeler-kpmu7md29-patrags-projects.vercel.app dental-survey.vercel.app
```

**Note**: Custom `.vercel.app` subdomains mungkin tidak tersedia untuk semua users.

---

## Post-Setup Checklist

After domain is configured:

### 1. Update Appwrite Platform

⚠️ **WAJIB!** Tambahkan custom domain ke Appwrite:

1. Buka: https://sgp.cloud.appwrite.io/console/project-691351eb00227fd3a6ea
2. Settings → Platforms → Add Platform → Web
3. Name: `Production - Custom Domain`
4. Hostname: `dental.yourdomain.com` (tanpa https://)
5. Save

### 2. Force HTTPS Redirect (Vercel Auto-enabled)

Vercel automatically redirects HTTP → HTTPS. Verify:
```bash
curl -I http://dental.yourdomain.com
# Should return 308 redirect to https://
```

### 3. Update Environment Variables (if needed)

If you use `NEXT_PUBLIC_APP_URL`:

```bash
echo "https://dental.yourdomain.com" | vercel env add NEXT_PUBLIC_APP_URL production
```

Then redeploy:
```bash
vercel --prod
```

### 4. Test Your Custom Domain

```bash
# Test DNS resolution
nslookup dental.yourdomain.com

# Test HTTPS
curl -I https://dental.yourdomain.com

# Test application
curl https://dental.yourdomain.com
```

Open in browser:
```
https://dental.yourdomain.com
```

### 5. Setup Email (Optional)

If you want emails from your domain:

**Option A: Google Workspace**
- $6/user/month
- Professional email: admin@yourdomain.com

**Option B: Zoho Mail (Free tier available)**
- Free for 5 users
- Email: admin@yourdomain.com

**Option C: Forward to Gmail**
- Setup email forwarding at your domain registrar
- Free, but can't send from custom domain

---

## Troubleshooting

### Domain shows "DNS Configuration Error"

**Solution:**
1. Double-check CNAME/A records are correct
2. Ensure no conflicting records (like existing A records for subdomain)
3. Wait 15-30 minutes for propagation
4. Clear DNS cache: `sudo systemd-resolve --flush-caches` (Linux)

### SSL Certificate not provisioning

**Solution:**
1. Ensure DNS is fully propagated (wait 30 min)
2. Remove and re-add domain in Vercel
3. Check no CAA records blocking Let's Encrypt

### Domain works but Appwrite shows CORS error

**Solution:**
1. Verify domain is added to Appwrite Platforms
2. Use exact hostname (no https://, no trailing slash)
3. Wait a few minutes for Appwrite to update

### www vs non-www

**Best Practice:**
- Choose one as primary (e.g., `dental.yourdomain.com`)
- Redirect the other automatically
- Vercel handles this automatically

---

## Quick Command Reference

```bash
# Add domain
vercel domains add <domain> geospasial-dental-modeler

# List domains
vercel domains ls

# Remove domain
vercel domains rm <domain>

# Check DNS
nslookup <domain>
dig <domain>

# Test HTTPS
curl -I https://<domain>

# View certificate
openssl s_client -connect <domain>:443 -servername <domain>
```

---

## Recommended Setup

**For Production:**
```
Primary: https://dental.yourdomain.com
Fallback: https://geospasial-dental-modeler.vercel.app
```

**For Testing/Staging:**
```
Staging: https://staging-dental.yourdomain.com
(Deploy from different branch)
```

---

**Ready to setup? Tell me your domain name and I'll help configure it!**
