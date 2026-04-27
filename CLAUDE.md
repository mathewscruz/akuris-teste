# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (localhost:8080)
npm run build      # Production build
npm run build:dev  # Dev build
npm run lint       # ESLint check
npm run preview    # Preview production build
```

There is no test framework configured in this project.

## Architecture Overview

This is a **multi-tenant enterprise GRC (Governance, Risk & Compliance) SaaS platform** built as a React SPA backed by Supabase.

### Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Routing:** React Router v6 with `React.lazy()` code splitting for all page routes
- **Server state:** TanStack React Query (2-minute stale time, max 2 retries)
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Edge Functions:** 45+ Deno TypeScript functions in `supabase/functions/`
- **i18n:** Portuguese (pt) and English (en) via `src/i18n/`, accessed through `LanguageContext`

### Data Flow

```
Browser → ProtectedRoute (auth + module permission check)
        → Layout (sidebar, notifications, AkurIA chatbot)
        → Page component
        → Custom hook (e.g. useAtivosStats) via TanStack React Query
        → Supabase JS client → PostgreSQL (RLS enforced per company_id)
```

Multi-tenancy is enforced at the database level via Row-Level Security (RLS). Every table query is automatically scoped to the authenticated user's `company_id`.

### Key Directories

- `src/pages/` — Route-level page components (40+), lazy-loaded in `App.tsx`
- `src/components/<domain>/` — Feature components grouped by business domain (ativos, riscos, controles, incidentes, etc.)
- `src/components/ui/` — shadcn/ui components (do not modify directly; regenerate via CLI)
- `src/hooks/` — Custom React hooks, primarily data-fetching hooks (e.g. `useAtivosStats`, `useRiscosStats`)
- `src/lib/` — Utilities: `pdf-utils.ts`, `csv-utils.ts`, `text-utils.ts`, `logger.ts`, `akuria-actions.ts` (AI)
- `src/integrations/supabase/` — `client.ts` (Supabase client singleton) and `types.ts` (auto-generated DB types, 7300+ lines)
- `src/i18n/pt.ts` and `src/i18n/en.ts` — Translation strings
- `supabase/functions/` — Edge Functions (Deno TypeScript)

### Auth & Permissions

- Auth is managed by `AuthProvider` (`src/components/AuthProvider.tsx`), which exposes `useAuth()`
- Session stored in localStorage via Supabase JWT with auto-refresh
- User roles: `super_admin`, `admin`, `user`, `readonly`
- Every protected page is wrapped in `<ProtectedRoute moduleName="...">` which checks the user's module-level permissions
- First-login forced password change is handled by `PasswordChangeRequired`
- MFA (TOTP) supported via `MFAVerification` component + Edge Functions

### Adding a New Page

1. Create `src/pages/MyPage.tsx`
2. Add a lazy import in `src/App.tsx`: `const MyPage = React.lazy(() => import('./pages/MyPage'))`
3. Add a `<Route>` inside the protected routes section, wrapped in `<ProtectedRoute moduleName="my-module">`
4. Add navigation in `src/components/AppSidebar.tsx`

### Supabase Data Fetching Pattern

Custom hooks use TanStack React Query wrapping Supabase queries:

```typescript
export const useMyData = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-data', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};
```

### Environment Variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

### Edge Functions

Edge Functions live in `supabase/functions/<function-name>/index.ts` and run on Deno. Categories:
- **AI:** `akuria-chat`, `ai-module-assistant`, `analyze-document-adherence`, `suggest-risk-treatment`
- **Auth/Users:** `create-user`, `send-mfa-code`, `verify-mfa-code`, `delete-user-complete`
- **Notifications:** 15+ email notification functions (e.g. `send-incident-notification`)
- **Integrations:** `azure-integration`, `api-inbound-webhook`, `api-public`
- **Payments:** `create-checkout`, `check-subscription`, `customer-portal` (Stripe)

### i18n

Use the `useLanguage()` hook from `LanguageContext`. Translation keys follow the pattern `module.feature.text`. User preference is synced to `profiles.preferred_locale` and cached in localStorage.

### TypeScript Configuration

TypeScript is configured with relaxed settings (`noImplicitAny: false`, `strictNullChecks: false`). Existing code does not rely on strict null safety — maintain that pattern when editing existing files.
