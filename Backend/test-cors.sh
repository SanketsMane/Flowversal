#!/bin/bash

echo "🧪 Testing CORS Configuration..."
echo ""

BACKEND_URL="http://localhost:3001"
ORIGIN="http://localhost:3000"

echo "1️⃣ Testing Health Endpoint..."
curl -s "$BACKEND_URL/health" | jq '.' 2>/dev/null || curl -s "$BACKEND_URL/health"
echo ""
echo ""

echo "2️⃣ Testing CORS Headers (GET request)..."
echo "Request: GET $BACKEND_URL/api/v1/projects"
echo "Origin: $ORIGIN"
echo ""
curl -v -H "Origin: $ORIGIN" \
     -H "Authorization: Bearer justin-access-token" \
     "$BACKEND_URL/api/v1/projects" 2>&1 | grep -i "access-control" || echo "❌ No CORS headers found!"
echo ""
echo ""

echo "3️⃣ Testing OPTIONS Preflight..."
echo "Request: OPTIONS $BACKEND_URL/api/v1/projects"
echo ""
curl -v -X OPTIONS \
     -H "Origin: $ORIGIN" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     "$BACKEND_URL/api/v1/projects" 2>&1 | grep -E "(HTTP|access-control)" || echo "❌ Preflight failed!"
echo ""
echo ""

echo "✅ CORS Test Complete!"
echo ""
echo "Expected Results:"
echo "  - Access-Control-Allow-Origin: $ORIGIN"
echo "  - Access-Control-Allow-Credentials: true"
echo "  - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS"
echo ""

