#!/bin/bash

# Test Appwrite Connection from Production

echo "🧪 Testing Appwrite Connection..."
echo ""

ENDPOINT="https://sgp.cloud.appwrite.io/v1"
PROJECT_ID="691351eb00227fd3a6ea"
VERCEL_URL="https://geospasial-dental-modeler.vercel.app"

echo "📍 Endpoint: $ENDPOINT"
echo "🆔 Project ID: $PROJECT_ID"
echo "🌐 Vercel URL: $VERCEL_URL"
echo ""

# Test 1: Ping Appwrite directly
echo "Test 1: Direct ping to Appwrite..."
curl -s -X GET "$ENDPOINT/health" | jq '.' || echo "❌ Failed"
echo ""

# Test 2: Ping with project ID
echo "Test 2: Ping with Project ID..."
curl -s -X GET "$ENDPOINT/health" \
  -H "X-Appwrite-Project: $PROJECT_ID" | jq '.' || echo "❌ Failed"
echo ""

# Test 3: Test from browser (check CORS)
echo "Test 3: Checking if Vercel can reach Appwrite..."
echo "Open this URL in browser:"
echo "$VERCEL_URL"
echo ""

# Test 4: Check Appwrite project
echo "Test 4: Verify project exists..."
curl -s -X GET "$ENDPOINT/health" | grep -q "status" && echo "✅ Appwrite is reachable" || echo "❌ Appwrite unreachable"
echo ""

echo "📋 Next Steps:"
echo "1. ✅ Pastikan platform sudah ditambahkan di Appwrite Console"
echo "2. 🌐 Buka: https://sgp.cloud.appwrite.io/console/project-691351eb00227fd3a6ea/settings"
echo "3. 👀 Verify di tab 'Platforms' ada entry dengan hostname:"
echo "   - geospasial-dental-modeler.vercel.app"
echo "4. ⏱️  Tunggu 1-2 menit, lalu test lagi"
echo "5. 🔄 Refresh halaman Vercel app dan coba lagi"
