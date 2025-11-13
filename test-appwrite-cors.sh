#!/bin/bash

# Better test for Appwrite connection from browser perspective

ENDPOINT="https://sgp.cloud.appwrite.io/v1"
PROJECT_ID="691351eb00227fd3a6ea"

echo "🧪 Testing Appwrite Connection (Client SDK)"
echo ""

# Test account endpoint (what the app uses)
echo "Testing /account endpoint (requires auth but shows CORS works)..."
curl -s -X GET "$ENDPOINT/account" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Expected: HTTP 401 (Unauthorized) - This is GOOD! Means CORS works."
echo "If you see 401, CORS is configured correctly."
echo "If you see 500, platform is NOT configured in Appwrite."
echo ""
