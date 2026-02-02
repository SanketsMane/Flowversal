═══════════════════════════════════════════════════════════════
⚠️⚠️⚠️  CRITICAL SECURITY WARNING - READ IMMEDIATELY  ⚠️⚠️⚠️
═══════════════════════════════════════════════════════════════

TEMPORARY SECURITY BYPASSES ARE ACTIVE IN THIS APPLICATION!

This application currently has authentication DISABLED for certain
endpoints to allow development testing. This is EXTREMELY DANGEROUS
and MUST be fixed before any production deployment.

═══════════════════════════════════════════════════════════════
WHAT'S BEEN BYPASSED:
═══════════════════════════════════════════════════════════════

✗ User onboarding endpoint accepts requests without authentication
✗ Demo tokens are accepted without proper validation  
✗ Auto-creation of users without verified identity
✗ Multiple security checks have been commented out

═══════════════════════════════════════════════════════════════
WHERE TO FIND MORE INFORMATION:
═══════════════════════════════════════════════════════════════

Full details: App/Backend/TEMPORARY_FIXES.md

Search for these in the code:
  - "⚠️ TEMPORARY"
  - "⚠️ SECURITY WARNING"
  - "TODO: Remove this"

═══════════════════════════════════════════════════════════════
IF ONBOARDING FAILS WITH ENCRYPTION ERRORS:
═══════════════════════════════════════════════════════════════

Run this command to clean up bad demo user data:
  cd App/Backend && npx ts-node scripts/cleanup-demo-users.ts

This will delete corrupted demo users from MongoDB and allow
fresh creation with proper data format.

═══════════════════════════════════════════════════════════════
BEFORE PRODUCTION DEPLOYMENT:
═══════════════════════════════════════════════════════════════

[ ] Remove /api/v1/users/me/onboarding from skipAuth list
[ ] Remove demo user auto-creation code
[ ] Remove demo token bypass from auth middleware
[ ] Fix email encryption (encrypt all or none)
[ ] Implement proper authentication for ALL endpoints
[ ] Test with real Supabase JWT tokens only
[ ] Run cleanup script to remove all demo users
[ ] Remove this warning file

═══════════════════════════════════════════════════════════════
WHY THIS WAS DONE:
═══════════════════════════════════════════════════════════════

These bypasses were added temporarily to allow the onboarding
flow to work during development when proper authentication was
not yet set up. They were NEVER intended for production use.

═══════════════════════════════════════════════════════════════
RISK LEVEL: 🔴 CRITICAL - DO NOT DEPLOY AS-IS
═══════════════════════════════════════════════════════════════

Contact: Development Team
Date: December 14, 2025
Status: TEMPORARY DEVELOPMENT ONLY
