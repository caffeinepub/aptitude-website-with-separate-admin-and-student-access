# Specification

## Summary
**Goal:** Provide a secure, one-time bootstrap flow so the first authenticated user can initialize themselves as the app’s initial Admin after deployment.

**Planned changes:**
- Add a backend shared method (e.g., `claimInitialAdmin`) that assigns the caller the Admin role only if no Admin has been set yet, and persists the “admin exists” state across upgrades.
- Ensure the backend rejects the claim when an Admin already exists or when the caller is not authenticated, and that existing admin-only methods become callable after a successful claim.
- Add a frontend call-to-action shown only to authenticated users when no Admin exists, with a confirmation step before claiming.
- On successful claim, refetch/invalidate role state and redirect the user to `/admin`; on failure, show clear English error messages and allow retry.

**User-visible outcome:** If no Admin has been initialized yet, an authenticated user can click “Initialize Admin Access,” confirm, and become the initial Admin; otherwise they see an explanation that Admin initialization is already complete.
