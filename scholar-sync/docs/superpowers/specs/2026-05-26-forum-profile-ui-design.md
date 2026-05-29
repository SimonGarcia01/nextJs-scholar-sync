# Forum, Profile & Non-Admin UI — Design Spec

**Date:** 2026-05-26  
**Project:** Scholar Sync — Frontend (Next.js)

---

## Scope

Three features added to the existing dashboard:

1. **Forum tab** — threaded posts/replies view for non-admin roles
2. **Profile modal** — logged-in user's info, level, and badges from the header
3. **Non-admin card UI** — Cursos as cards, Insignias as badge grid

Admin retains all existing table tabs unchanged.

---

## 1. Role Detection

**What:** Expose `roles: string[]` from the JWT payload in the auth store.

**How:**
- Add `getRolesFromToken(token: string | null): string[]` to `lib/jwt.ts`, mirroring `getPermissionsFromToken`.
- Add `roles: string[]` to `AuthState` in `_store/authStore.ts`. Populate it in `setToken` alongside `permissions`.
- In `dashboard/page.tsx`, derive `const isAdmin = roles.includes("Admin")` to conditionally render tab components.

**Constraint:** No backend changes. Roles come from the existing JWT payload field `roles`.

---

## 2. Forum Tab (non-admin)

**Who sees it:** Student, TA, Professor — anyone who is not Admin.

**Sidebar:** A single "Foro" tab replaces the "Posts" and "Respuestas" tabs for these roles. Admin retains both original tabs.

**State:** `ForumTab` owns internal state `selectedPostId: number | null`. `null` = list view, non-null = thread view.

### 2a. List view

- Grid/list of post cards: título, autor, fecha, contador de replies.
- Click on card → sets `selectedPostId`, transitions to thread view.

### 2b. Thread view

- "← Volver" button resets `selectedPostId` to `null`.
- Post header: título, contenido completo, autor, fecha.
- Reply list below: autor, contenido, estado (Aprobada / Pendiente), número de aprobaciones.
- **Validate button:** visible when `roles.includes("Professor") || roles.includes("TA")`, only on replies with `validated = false`. Calls `PATCH /reply/:id/validate`. Updates reply state locally on success.
- **Add reply form:** visible to users with `Create` permission on `replies`. Calls `POST /reply` with `{ postId, content }`. Prepends new reply to local list on success.

### 2c. Data fetching

- List view: `GET /post` — fetched on first tab open, cached in `ForumTab` local state.
- Thread view: `GET /reply` — fetch all replies on first thread open, filter client-side by `reply.post.id === selectedPostId`. Result cached per post ID in a `Record<number, Reply[]>` within `ForumTab`. If the API later supports `?postId=X`, filtering can move server-side without structural changes.

### 2d. New components

```
components/dashboard/tabs/ForumTab.tsx        ← orchestrates list/thread state
components/dashboard/forum/PostCard.tsx       ← single post card in list
components/dashboard/forum/PostThread.tsx     ← thread view container
components/dashboard/forum/ReplyItem.tsx      ← single reply row
```

---

## 3. Cursos — Card View (non-admin)

**Component:** `components/dashboard/tabs/CoursesCardTab.tsx`

**Props:** Same `EntityTabProps` as existing tabs — reuses data already fetched by dashboard.

**Layout:** Responsive grid (1 col mobile, 2 col md, 3 col lg). Each card shows:
- Nombre del curso (heading)
- Créditos, Duración, Fecha inicio

No edit/delete actions rendered (non-admin users rarely have those permissions; permissions props still passed in but UI won't show action buttons).

**Admin:** Continues to use existing `CoursesTab.tsx` (table).

---

## 4. Insignias — Badge Grid (non-admin)

**Component:** `components/dashboard/tabs/BadgesGridTab.tsx`

**Props:** Same `EntityTabProps`.

**Layout:** Responsive grid of badge cards. Each card:
- Emoji/icon placeholder (no image field in entity)
- Nombre de la insignia
- Nivel mínimo requerido
- Mensaje

**Admin:** Continues to use existing `ExperienceBadgesTab.tsx` (table).

---

## 5. Profile Modal

**Trigger:** Button in `AppHeader.tsx` showing user's name (or first initial as avatar circle). Click opens modal.

**State:** `profileOpen: boolean` lives in `dashboard/page.tsx`, passed as prop to `AppHeader`. AppHeader calls `onProfileOpen()`.

**Data sources (fetched in parallel on first open, cached locally):**
- `GET /user/:sub` — nombre, email, nivel. `sub` comes from decoded JWT.
- `GET /user-badge` — filtered client-side to entries matching current user's `sub`.
- Roles — from `authStore.roles` (already in memory, no extra fetch).

**Modal content:**
- Avatar circle with initials
- Nombre completo, email
- Roles (chips/tags)
- Nivel (if present on user entity)
- Badges earned: small grid of badge names/icons

**Behavior:**
- Close on backdrop click or X button.
- Keyboard: `Escape` closes.

**New component:** `components/dashboard/ProfileModal.tsx`

---

## 6. Dashboard Integration

Changes to `dashboard/page.tsx`:

- Import `getRolesFromToken` → derive `isAdmin`.
- Add `profileOpen` state + `profileData` cache state.
- Swap tab component based on `isAdmin`:
  - `posts` + `replies` tabs: hidden for non-admin; `foro` tab added for non-admin.
  - `courses` tab: `CoursesCardTab` for non-admin, `CoursesTab` for admin.
  - `experience_badges` tab: `BadgesGridTab` for non-admin, `ExperienceBadgesTab` for admin.
- Pass `onProfileOpen` and user name to `AppHeader`.

---

## 7. Files Changed / Created

| File | Action |
|---|---|
| `lib/jwt.ts` | Add `getRolesFromToken` |
| `_store/authStore.ts` | Add `roles` field |
| `components/dashboard/AppHeader.tsx` | Add profile button + `onProfileOpen` prop |
| `components/dashboard/ProfileModal.tsx` | New |
| `components/dashboard/tabs/ForumTab.tsx` | New |
| `components/dashboard/forum/PostCard.tsx` | New |
| `components/dashboard/forum/PostThread.tsx` | New |
| `components/dashboard/forum/ReplyItem.tsx` | New |
| `components/dashboard/tabs/CoursesCardTab.tsx` | New |
| `components/dashboard/tabs/BadgesGridTab.tsx` | New |
| `app/dashboard/page.tsx` | Role-based component swap + profile state |

Existing tab components (PostsTab, RepliesTab, CoursesTab, ExperienceBadgesTab) unchanged.

---

## 8. Out of Scope

- "Nuevo post" creation form in forum (can be added later)
- Viewing other users' profiles
- Image/avatar upload
- Real-time updates (no WebSocket)
