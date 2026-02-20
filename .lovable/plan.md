
# Fix: MFA Screen Not Appearing (Race Condition)

## Root Cause

When `signInWithPassword` is called, Supabase's `onAuthStateChange(SIGNED_IN)` fires in the `AuthProvider`, setting `user` to a truthy value. This causes line 65 of `Auth.tsx`:

```
if (!loading && user) return <Navigate to="/dashboard" replace />;
```

...to immediately navigate away from `/auth`, **unmounting** the Auth component. Then when `signOut()` fires, the user is redirected back to `/auth`, but the component **remounts** with fresh state (`mfaPending = false`). The MFA screen never appears.

## Solution

Use a **React ref** (`useRef`) to synchronously flag that MFA is in progress BEFORE calling `signInWithPassword`. Refs update instantly (unlike `setState` which is async/batched), so the redirect guard will see the flag immediately when `onAuthStateChange` triggers a re-render.

## Changes in `src/pages/Auth.tsx`

1. Add `const mfaInProgressRef = useRef(false);` at the top of the component
2. Set `mfaInProgressRef.current = true` BEFORE calling `signInWithPassword` (not after)
3. Update the redirect guard on line 65 to: `if (!loading && user && !mfaInProgressRef.current) return <Navigate to="/dashboard" replace />;`
4. Reset `mfaInProgressRef.current = false` in `handleMFAVerified` and `handleMFACancel`, and in all MFA error fallback paths
5. Keep the existing `mfaPending` state for rendering the MFA verification screen (the ref only blocks navigation)

## Why a Ref and Not Just State?

- `setState` is batched/async -- the re-render from `onAuthStateChange` can happen before the new state is committed
- `useRef` updates synchronously and is readable immediately on the next render without waiting for a commit
- This eliminates the race condition entirely

## Files Modified
- `src/pages/Auth.tsx` only (approximately 10 lines changed)
