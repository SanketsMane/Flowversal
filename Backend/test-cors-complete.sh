#!/bin/bash

# Complete CORS Test Script
# Tests CORS configuration from multiple angles

echo "🧪 Testing CORS Configuration..."
echo ""

# Test 1: Health endpoint with Origin header
echo "Test 1: GET /api/v1/health with Origin header"
curl -v -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     http://localhost:3001/api/v1/health 2>&1 | grep -i "access-control" || echo "❌ No CORS headers found"
echo ""

# Test 2: OPTIONS preflight request
echo "Test 2: OPTIONS preflight request"
curl -v -X OPTIONS \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     http://localhost:3001/api/v1/health 2>&1 | grep -i "access-control" || echo "❌ No CORS headers found"
echo ""

# Test 3: Projects endpoint with auth
echo "Test 3: GET /api/v1/projects with auth token"
curl -v -H "Origin: http://localhost:3000" \
     -H "Authorization: Bearer justin-access-token" \
     http://localhost:3001/api/v1/projects 2>&1 | grep -i "access-control" || echo "❌ No CORS headers found"
echo ""

# Test 4: Check if server is running
echo "Test 4: Server health check"
curl -s http://localhost:3001/api/v1/health | jq '.' || echo "❌ Server not responding"
echo ""

echo "✅ CORS tests complete"

