#!/bin/bash

# ================================================
# TARGET SHEET - COMPREHENSIVE TESTING SCRIPT
# ================================================
# This script tests the authentication and database fixes

echo "=================================="
echo "TARGET SHEET - TESTING SCRIPT"
echo "=================================="

# Test server availability
echo "1. Testing server availability..."
curl -I http://localhost:8081 || { echo "❌ Server not running on port 8081"; exit 1; }
echo "✅ Server is running"

# Test main routes
echo ""
echo "2. Testing main application routes..."

# Test welcome page
echo "  Testing /welcome route..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/welcome | grep -q "200" && echo "  ✅ /welcome - OK" || echo "  ❌ /welcome - Failed"

# Test sign-in page  
echo "  Testing /sign-in route..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/sign-in | grep -q "200" && echo "  ✅ /sign-in - OK" || echo "  ❌ /sign-in - Failed"

# Test sign-up page
echo "  Testing /sign-up route..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/sign-up | grep -q "200" && echo "  ✅ /sign-up - OK" || echo "  ❌ /sign-up - Failed"

# Test auth callback route
echo "  Testing /auth/callback route..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/auth/callback | grep -q "200" && echo "  ✅ /auth/callback - OK" || echo "  ❌ /auth/callback - Failed"

# Test Supabase connection
echo ""
echo "3. Testing Supabase connection..."
SUPABASE_URL="https://yhrtctmhbrfwjiqcqzle.supabase.co"
curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" | grep -q "200" && echo "  ✅ Supabase API - Reachable" || echo "  ❌ Supabase API - Failed"

# Test Supabase Auth endpoint
echo "  Testing Supabase Auth endpoint..."
curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/auth/v1/settings" | grep -q "200" && echo "  ✅ Supabase Auth - OK" || echo "  ❌ Supabase Auth - Failed"

echo ""
echo "=================================="
echo "TESTING COMPLETE"
echo "=================================="

echo ""
echo "Next steps to verify fixes:"
echo "1. Open http://localhost:8081 in browser"
echo "2. Test sign-up/sign-in flows"
echo "3. After authentication, test target creation"
echo "4. Apply RLS policies in Supabase SQL Editor:"
echo "   - Run the script: supabase-rls-setup.sql"
echo "5. Test that 403 errors are resolved"

echo ""
echo "RLS Policy Setup:"
echo "1. Go to your Supabase dashboard"
echo "2. Open SQL Editor"
echo "3. Run the contents of supabase-rls-setup.sql"
echo "4. Verify policies are applied correctly"

echo ""
echo "If you see any ❌ failures above, check:"
echo "- Server is running: npm start"
echo "- Network connectivity"
echo "- Supabase project settings"
echo "- Environment variables in .env file"
