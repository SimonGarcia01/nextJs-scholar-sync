# Forum, Profile & Non-Admin UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a threaded forum view, a user profile modal, and card-based UI for Cursos/Insignias tabs for non-admin roles in the Scholar Sync dashboard.

**Architecture:** `getRolesFromToken` extracts roles from the JWT and stores them in Zustand. `isAdmin = roles.includes("Admin")` in `dashboard/page.tsx` controls which tab components render. Admin keeps all existing table tabs unchanged. Non-admin gets `ForumTab` (self-fetching threaded view replacing Posts+Replies), `CoursesCardTab` (card grid), and `BadgesGridTab` (badge grid). `ProfileModal` opens from the header button.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zustand, Axios via `apiService`, Tailwind 4. No test framework in frontend — no TDD steps.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/jwt.ts` | Modify | Add `sub`, `email`, `roles` to `JwtPayload`; add `getRolesFromToken` |
| `_store/authStore.ts` | Modify | Add `roles: string[]` to state; populate in `setToken` and `migrate` |
| `components/dashboard/AppHeader.tsx` | Create | Sticky header with menu toggle + profile button |
| `components/dashboard/ProfileModal.tsx` | Create | Modal: user info, roles, level, earned badges |
| `components/dashboard/forum/PostCard.tsx` | Create | Card for a single post in the forum list |
| `components/dashboard/forum/ReplyItem.tsx` | Create | Row for a single reply in thread view |
| `components/dashboard/forum/PostThread.tsx` | Create | Thread view: post header + reply list + add-reply form |
| `components/dashboard/tabs/ForumTab.tsx` | Create | Orchestrates list ↔ thread state; owns all forum fetching |
| `components/dashboard/tabs/CoursesCardTab.tsx` | Create | Card grid for courses (non-admin view) |
| `components/dashboard/tabs/BadgesGridTab.tsx` | Create | Badge grid for experience badges (non-admin view) |
| `app/dashboard/page.tsx` | Modify | Role-based tab component selection; profile state; AppHeader |

---

## Task 1: Extend JWT utilities with roles

**Files:**
- Modify: `lib/jwt.ts`

- [ ] **Step 1: Update `JwtPayload` type and add `getRolesFromToken`**

Replace the entire contents of `lib/jwt.ts` with:

```ts
export type JwtPayload = {
    sub?: number;
    email?: string;
    roles?: string[];
    permissions?: string[];
};

const decodeBase64Url = (value: string) => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return atob(padded);
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
    const parts = token.split(".");
    if (parts.length < 2) {
        return null;
    }

    try {
        const json = decodeBase64Url(parts[1]);
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
};

export const getPermissionsFromToken = (token: string | null): string[] => {
    if (!token) {
        return [];
    }
    const payload = decodeJwtPayload(token);
    return Array.isArray(payload?.permissions) ? payload.permissions : [];
};

export const getRolesFromToken = (token: string | null): string[] => {
    if (!token) {
        return [];
    }
    const payload = decodeJwtPayload(token);
    return Array.isArray(payload?.roles) ? payload.roles : [];
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd nextJs-scholar-sync/scholar-sync && bun run build 2>&1 | head -30
```

Expected: no errors related to `jwt.ts`.

- [ ] **Step 3: Commit**

```bash
git add nextJs-scholar-sync/scholar-sync/lib/jwt.ts
git commit -m "feat: add getRolesFromToken to jwt utilities"
```

---

## Task 2: Add roles to auth store

**Files:**
- Modify: `_store/authStore.ts`

- [ ] **Step 1: Update authStore to include `roles`**

Replace the entire file:

```ts
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setAuthToken } from "@/lib/axios";
import { getPermissionsFromToken, getRolesFromToken } from "@/lib/jwt";

type AuthState = {
    token: string | null;
    permissions: string[];
    roles: string[];
    setToken: (token: string | null) => void;
    setPermissions: (permissions: string[]) => void;
    clearAuth: () => void;
};

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            permissions: [],
            roles: [],
            setToken: (token) => {
                setAuthToken(token);
                set({
                    token,
                    permissions: getPermissionsFromToken(token),
                    roles: getRolesFromToken(token),
                });
            },
            setPermissions: (permissions) => set({ permissions }),
            clearAuth: () => {
                setAuthToken(null);
                set({ token: null, permissions: [], roles: [] });
            },
        }),
        {
            name: "scholar-sync-auth",
            version: 1,
            storage: createJSONStorage(() => localStorage),
            migrate: (persistedState) => {
                const state = persistedState as Partial<AuthState> & {
                    token?: string | null;
                };
                const token = state?.token ?? null;
                const permissions = Array.isArray(state?.permissions)
                    ? state.permissions
                    : getPermissionsFromToken(token);
                const roles = Array.isArray(state?.roles)
                    ? state.roles
                    : getRolesFromToken(token);

                return { token, permissions, roles } as AuthState;
            },
            onRehydrateStorage: () => (state) => {
                if (state?.token) {
                    setAuthToken(state.token);
                    if (!state.permissions?.length) {
                        state.setPermissions(
                            getPermissionsFromToken(state.token)
                        );
                    }
                }
            },
        }
    )
);

export default useAuthStore;
```

- [ ] **Step 2: Verify build**

```bash
cd nextJs-scholar-sync/scholar-sync && bun run build 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add nextJs-scholar-sync/scholar-sync/_store/authStore.ts
git commit -m "feat: add roles field to auth store"
```

---

## Task 3: Create AppHeader component

**Files:**
- Create: `components/dashboard/AppHeader.tsx`

The dashboard's inline `<header>` block will be replaced with this component in Task 7.

- [ ] **Step 1: Create `components/dashboard/AppHeader.tsx`**

```tsx
"use client";

import { MenuIcon } from "@/components/dashboard/Icons";

type AppHeaderProps = {
    tabLabel: string;
    userName: string;
    onMenuToggle: () => void;
    onProfileOpen: () => void;
};

export default function AppHeader({
    tabLabel,
    userName,
    onMenuToggle,
    onProfileOpen,
}: AppHeaderProps) {
    const initials = userName
        .split(/[\s@]+/)
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <header className="sticky top-0 z-10 bg-(--blue-50)/90 backdrop-blur border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onMenuToggle}
                        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white"
                        aria-label="Toggle menu"
                    >
                        <MenuIcon className="h-5 w-5 text-slate-700" />
                    </button>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                            Panel principal
                        </p>
                        <h1 className="text-xl font-semibold text-slate-900">
                            {tabLabel}
                        </h1>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onProfileOpen}
                    className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    aria-label="Ver perfil"
                >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {initials || "?"}
                    </span>
                    <span className="hidden sm:inline max-w-[140px] truncate">
                        {userName}
                    </span>
                </button>
            </div>
        </header>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add nextJs-scholar-sync/scholar-sync/components/dashboard/AppHeader.tsx
git commit -m "feat: add AppHeader component with profile button"
```

---

## Task 4: Create ProfileModal component

**Files:**
- Create: `components/dashboard/ProfileModal.tsx`

The modal fetches `GET /user/:id` and `GET /user-badge` on first open. `sub` (user ID) comes from the decoded JWT payload.

- [ ] **Step 1: Create `components/dashboard/ProfileModal.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import apiService from "@/lib/apiService";

type UserProfile = {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    level?: number | string;
};

type BadgeEntry = {
    id: number | string;
    experienceBadge?: { name?: string; message?: string; minLevel?: number };
    badge?: { name?: string };
    dateAcquired?: string;
};

type ProfileModalProps = {
    isOpen: boolean;
    userId: number | null;
    userEmail: string;
    roles: string[];
    onClose: () => void;
};

export default function ProfileModal({
    isOpen,
    userId,
    userEmail,
    roles,
    onClose,
}: ProfileModalProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [badges, setBadges] = useState<BadgeEntry[]>([]);
    const [loaded, setLoaded] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || loaded || userId === null) {
            return;
        }

        Promise.all([
            apiService.get<UserProfile>(`/user/${userId}`),
            apiService.get<BadgeEntry[]>("/user-badge"),
        ])
            .then(([userData, badgeData]) => {
                setProfile(userData);
                const mine = Array.isArray(badgeData)
                    ? badgeData.filter((entry) => {
                          const entryUserId =
                              (entry as Record<string, unknown> & { user?: { id?: number } }).user?.id;
                          return entryUserId === userId;
                      })
                    : [];
                setBadges(mine);
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, [isOpen, loaded, userId]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const fullName = profile
        ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
          profile.email ||
          userEmail
        : userEmail;

    const initials = fullName
        .split(/[\s@]+/)
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === backdropRef.current) {
                    onClose();
                }
            }}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                <div className="flex flex-col items-center gap-3 mb-6">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                        {initials || "?"}
                    </span>
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {fullName}
                        </h2>
                        {profile?.email && profile.email !== fullName && (
                            <p className="text-sm text-slate-500">
                                {profile.email}
                            </p>
                        )}
                    </div>
                </div>

                {!loaded && (
                    <p className="text-center text-sm text-slate-400">
                        Cargando...
                    </p>
                )}

                {loaded && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role) => (
                                <span
                                    key={role}
                                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                                >
                                    {role}
                                </span>
                            ))}
                        </div>

                        {profile?.level !== undefined &&
                            profile.level !== null && (
                                <div className="rounded-xl bg-slate-50 px-4 py-3">
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                                        Nivel
                                    </p>
                                    <p className="text-slate-800 font-medium mt-0.5">
                                        {String(profile.level)}
                                    </p>
                                </div>
                            )}

                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">
                                Insignias ({badges.length})
                            </p>
                            {badges.length === 0 ? (
                                <p className="text-sm text-slate-400">
                                    Sin insignias por ahora.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {badges.map((entry) => {
                                        const name =
                                            entry.experienceBadge?.name ??
                                            entry.badge?.name ??
                                            "Insignia";
                                        const msg =
                                            entry.experienceBadge?.message;
                                        return (
                                            <div
                                                key={entry.id}
                                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                                            >
                                                <p className="text-xs font-semibold text-slate-700">
                                                    🏅 {name}
                                                </p>
                                                {msg && (
                                                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                        {msg}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify build**

```bash
cd nextJs-scholar-sync/scholar-sync && bun run build 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add nextJs-scholar-sync/scholar-sync/components/dashboard/ProfileModal.tsx
git commit -m "feat: add ProfileModal component"
```

---

## Task 5: Create forum sub-components

**Files:**
- Create: `components/dashboard/forum/PostCard.tsx`
- Create: `components/dashboard/forum/ReplyItem.tsx`
- Create: `components/dashboard/forum/PostThread.tsx`

These three components are used by `ForumTab` (Task 6).

### Types shared by forum components

The types below are used across all three files. Define them in `PostCard.tsx` and import in the others.

```ts
export type ForumPost = {
    id: number | string;
    title?: string;
    content?: string;
    createdAt?: string;
    user?: { id?: number; email?: string; firstName?: string; lastName?: string };
    replies?: ForumReply[];
};

export type ForumReply = {
    id: number | string;
    content?: string;
    createdAt?: string;
    validated?: boolean;
    approvals?: number;
    user?: { id?: number; email?: string };
    post?: { id?: number | string; title?: string };
};
```

- [ ] **Step 1: Create `components/dashboard/forum/PostCard.tsx`**

```tsx
export type ForumPost = {
    id: number | string;
    title?: string;
    content?: string;
    createdAt?: string;
    user?: {
        id?: number;
        email?: string;
        firstName?: string;
        lastName?: string;
    };
    replies?: ForumReply[];
};

export type ForumReply = {
    id: number | string;
    content?: string;
    createdAt?: string;
    validated?: boolean;
    approvals?: number;
    user?: { id?: number; email?: string };
    post?: { id?: number | string; title?: string };
};

type PostCardProps = {
    post: ForumPost;
    replyCount: number;
    onClick: () => void;
};

export default function PostCard({ post, replyCount, onClick }: PostCardProps) {
    const author =
        post.user?.firstName
            ? `${post.user.firstName} ${post.user.lastName ?? ""}`.trim()
            : (post.user?.email ?? "Desconocido");

    const date = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition group"
        >
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                {post.title ?? "Sin título"}
            </h3>
            {post.content && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                    {post.content}
                </p>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{author}</span>
                <div className="flex items-center gap-3">
                    {date && <span>{date}</span>}
                    <span className="font-medium text-slate-600">
                        💬 {replyCount}
                    </span>
                </div>
            </div>
        </button>
    );
}
```

- [ ] **Step 2: Create `components/dashboard/forum/ReplyItem.tsx`**

```tsx
import type { ForumReply } from "@/components/dashboard/forum/PostCard";

type ReplyItemProps = {
    reply: ForumReply;
    canValidate: boolean;
    onValidate: (id: number | string) => void;
};

export default function ReplyItem({
    reply,
    canValidate,
    onValidate,
}: ReplyItemProps) {
    const author = reply.user?.email ?? "Desconocido";
    const date = reply.createdAt
        ? new Date(reply.createdAt).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    return (
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-slate-800 flex-1">
                    {reply.content ?? "Sin contenido."}
                </p>
                {canValidate && !reply.validated && (
                    <button
                        type="button"
                        onClick={() => onValidate(reply.id)}
                        className="shrink-0 rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
                    >
                        Validar
                    </button>
                )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span>{author}</span>
                {date && <span>{date}</span>}
                {reply.approvals !== undefined && reply.approvals > 0 && (
                    <span>👍 {reply.approvals}</span>
                )}
                {reply.validated && (
                    <span className="font-medium text-green-600">✓ Aprobada</span>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Create `components/dashboard/forum/PostThread.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { ForumPost, ForumReply } from "@/components/dashboard/forum/PostCard";
import ReplyItem from "@/components/dashboard/forum/ReplyItem";
import apiService from "@/lib/apiService";

type PostThreadProps = {
    post: ForumPost;
    replies: ForumReply[];
    canValidate: boolean;
    canCreate: boolean;
    onBack: () => void;
    onReplyValidated: (replyId: number | string) => void;
    onReplyAdded: (reply: ForumReply) => void;
};

export default function PostThread({
    post,
    replies,
    canValidate,
    canCreate,
    onBack,
    onReplyValidated,
    onReplyAdded,
}: PostThreadProps) {
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const author =
        post.user?.firstName
            ? `${post.user.firstName} ${post.user.lastName ?? ""}`.trim()
            : (post.user?.email ?? "Desconocido");

    const date = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : null;

    const handleValidate = async (replyId: number | string) => {
        await apiService.patch(`/reply/${replyId}/validate`, {});
        onReplyValidated(replyId);
    };

    const handleSubmitReply = async () => {
        const content = replyContent.trim();
        if (!content) {
            return;
        }
        setSubmitting(true);
        try {
            const created = await apiService.post<ForumReply>("/reply", {
                postId: post.id,
                content,
            });
            onReplyAdded(created);
            setReplyContent("");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition"
            >
                ← Volver
            </button>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-slate-900">
                    {post.title ?? "Sin título"}
                </h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span>{author}</span>
                    {date && <span>{date}</span>}
                </div>
                {post.content && (
                    <p className="mt-4 text-sm text-slate-700 leading-relaxed">
                        {post.content}
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Respuestas ({replies.length})
                </h3>
                {replies.length === 0 && (
                    <p className="text-sm text-slate-400">
                        Sin respuestas todavía.
                    </p>
                )}
                {replies.map((reply) => (
                    <ReplyItem
                        key={reply.id}
                        reply={reply}
                        canValidate={canValidate}
                        onValidate={handleValidate}
                    />
                ))}
            </div>

            {canCreate && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">
                        Agregar respuesta
                    </h3>
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={3}
                        placeholder="Escribe tu respuesta..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                    <button
                        type="button"
                        disabled={submitting || !replyContent.trim()}
                        onClick={handleSubmitReply}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 transition"
                    >
                        {submitting ? "Enviando..." : "Enviar"}
                    </button>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 4: Verify build**

```bash
cd nextJs-scholar-sync/scholar-sync && bun run build 2>&1 | head -40
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add nextJs-scholar-sync/scholar-sync/components/dashboard/forum/
git commit -m "feat: add forum sub-components (PostCard, ReplyItem, PostThread)"
```

---

## Task 6: Create ForumTab

**Files:**
- Create: `components/dashboard/tabs/ForumTab.tsx`

`ForumTab` is self-contained. It fetches its own data from `/post` and `/reply`. The dashboard passes `roles`, `canCreate`, and `canDelete` — it does NOT pass `rows` from its own fetch.

- [ ] **Step 1: Create `components/dashboard/tabs/ForumTab.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import apiService from "@/lib/apiService";
import PostCard, {
    type ForumPost,
    type ForumReply,
} from "@/components/dashboard/forum/PostCard";
import PostThread from "@/components/dashboard/forum/PostThread";

type ForumTabProps = {
    roles: string[];
    canCreate: boolean;
};

export default function ForumTab({ roles, canCreate }: ForumTabProps) {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [allReplies, setAllReplies] = useState<ForumReply[]>([]);
    const [selectedPostId, setSelectedPostId] = useState<
        number | string | null
    >(null);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingReplies, setLoadingReplies] = useState(true);

    const canValidate =
        roles.includes("Professor") || roles.includes("TA");

    useEffect(() => {
        let active = true;
        apiService
            .get<ForumPost[]>("/post")
            .then((data) => {
                if (active) {
                    setPosts(Array.isArray(data) ? data : []);
                    setLoadingPosts(false);
                }
            })
            .catch(() => {
                if (active) setLoadingPosts(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        apiService
            .get<ForumReply[]>("/reply")
            .then((data) => {
                if (active) {
                    setAllReplies(Array.isArray(data) ? data : []);
                    setLoadingReplies(false);
                }
            })
            .catch(() => {
                if (active) setLoadingReplies(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const getRepliesForPost = (postId: number | string): ForumReply[] => {
        return allReplies.filter((r) => {
            const pid = r.post?.id;
            return String(pid) === String(postId);
        });
    };

    const handleReplyValidated = (replyId: number | string) => {
        setAllReplies((prev) =>
            prev.map((r) =>
                String(r.id) === String(replyId) ? { ...r, validated: true } : r
            )
        );
    };

    const handleReplyAdded = (reply: ForumReply) => {
        setAllReplies((prev) => [...prev, reply]);
    };

    const isLoading = loadingPosts || loadingReplies;

    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">Cargando foro...</p>
            </div>
        );
    }

    if (selectedPostId !== null) {
        const post = posts.find(
            (p) => String(p.id) === String(selectedPostId)
        );
        if (!post) {
            return null;
        }
        const replies = getRepliesForPost(selectedPostId);
        return (
            <PostThread
                post={post}
                replies={replies}
                canValidate={canValidate}
                canCreate={canCreate}
                onBack={() => setSelectedPostId(null)}
                onReplyValidated={handleReplyValidated}
                onReplyAdded={handleReplyAdded}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Foro
                    </h2>
                    <p className="text-sm text-slate-500">
                        Publicaciones y discusiones del curso.
                    </p>
                </div>
            </div>
            {posts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <p className="text-slate-500 text-sm">
                        Sin publicaciones por ahora.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            replyCount={getRepliesForPost(post.id).length}
                            onClick={() => setSelectedPostId(post.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Verify build**

```bash
cd nextJs-scholar-sync/scholar-sync && bun run build 2>&1 | head -40
```

- [ ] **Step 3: Commit**

```bash
git add nextJs-scholar-sync/scholar-sync/components/dashboard/tabs/ForumTab.tsx
git commit -m "feat: add ForumTab with threaded post/reply view"
```

---

## Task 7: Create CoursesCardTab and BadgesGridTab

**Files:**
- Create: `components/dashboard/tabs/CoursesCardTab.tsx`
- Create: `components/dashboard/tabs/BadgesGridTab.tsx`

Both receive `EntityTabProps` and reuse `rows` already fetched by the dashboard — no extra fetch needed.

- [ ] **Step 1: Create `components/dashboard/tabs/CoursesCardTab.tsx`**

```tsx
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function CoursesCardTab({
    rows,
    isLoading,
    emptyMessage,
}: EntityTabProps) {
    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">Cargando cursos...</p>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">
                    {emptyMessage ?? "Sin cursos por ahora."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Cursos
                </h2>
                <p className="text-sm text-slate-500">
                    Materias activas del semestre.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => (
                    <div
                        key={row.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                    >
                        <h3 className="font-semibold text-slate-900 line-clamp-2">
                            {String(row.Nombre ?? "-")}
                        </h3>
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                            {row.Creditos !== "-" && (
                                <p>
                                    <span className="text-slate-400">
                                        Créditos:
                                    </span>{" "}
                                    {String(row.Creditos)}
                                </p>
                            )}
                            {row.Duracion !== "-" && (
                                <p>
                                    <span className="text-slate-400">
                                        Duración:
                                    </span>{" "}
                                    {String(row.Duracion)}
                                </p>
                            )}
                            {row.Inicio !== "-" && (
                                <p>
                                    <span className="text-slate-400">
                                        Inicio:
                                    </span>{" "}
                                    {String(row.Inicio)}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Create `components/dashboard/tabs/BadgesGridTab.tsx`**

```tsx
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function BadgesGridTab({
    rows,
    isLoading,
    emptyMessage,
}: EntityTabProps) {
    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">
                    Cargando insignias...
                </p>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">
                    {emptyMessage ?? "Sin insignias por ahora."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Insignias
                </h2>
                <p className="text-sm text-slate-500">
                    Logros disponibles en la plataforma.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => (
                    <div
                        key={row.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center text-center gap-2"
                    >
                        <span className="text-3xl">🏅</span>
                        <h3 className="font-semibold text-slate-900">
                            {String(row.Insignia ?? "-")}
                        </h3>
                        {row.Nivel !== "-" && (
                            <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">
                                Nivel {String(row.Nivel)}
                            </span>
                        )}
                        {row.Mensaje !== "-" && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                                {String(row.Mensaje)}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Verify build**

```bash
cd nextJs-scholar-sync/scholar-sync && bun run build 2>&1 | head -40
```

- [ ] **Step 4: Commit**

```bash
git add nextJs-scholar-sync/scholar-sync/components/dashboard/tabs/CoursesCardTab.tsx nextJs-scholar-sync/scholar-sync/components/dashboard/tabs/BadgesGridTab.tsx
git commit -m "feat: add CoursesCardTab and BadgesGridTab for non-admin roles"
```

---

## Task 8: Wire everything into dashboard/page.tsx

**Files:**
- Modify: `app/dashboard/page.tsx`

This is the integration task. Changes:
1. Import all new components
2. Read `roles` from auth store; derive `isAdmin`
3. Decode `sub` and `email` from token for AppHeader and ProfileModal
4. Add `foro` tab config; filter tabs by role
5. Swap tab components based on `isAdmin`
6. Replace inline `<header>` with `<AppHeader>`
7. Add `profileOpen` state + `ProfileModal`

- [ ] **Step 1: Replace `app/dashboard/page.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import Sidebar, { SidebarItemData } from "@/components/dashboard/Sidebar";
import AppHeader from "@/components/dashboard/AppHeader";
import ProfileModal from "@/components/dashboard/ProfileModal";
import UsersTab from "@/components/dashboard/tabs/UsersTab";
import RolesTab from "@/components/dashboard/tabs/RolesTab";
import PermissionsTab from "@/components/dashboard/tabs/PermissionsTab";
import CoursesTab from "@/components/dashboard/tabs/CoursesTab";
import CoursesCardTab from "@/components/dashboard/tabs/CoursesCardTab";
import SupplementarySessionsTab from "@/components/dashboard/tabs/SupplementarySessionsTab";
import ExperienceBadgesTab from "@/components/dashboard/tabs/ExperienceBadgesTab";
import BadgesGridTab from "@/components/dashboard/tabs/BadgesGridTab";
import UserBadgesTab from "@/components/dashboard/tabs/UserBadgesTab";
import PostsTab from "@/components/dashboard/tabs/PostsTab";
import RepliesTab from "@/components/dashboard/tabs/RepliesTab";
import ForumTab from "@/components/dashboard/tabs/ForumTab";
import apiService from "@/lib/apiService";
import useAuthStore from "@/_store/authStore";
import { decodeJwtPayload } from "@/lib/jwt";
import type {
    EntityTabProps,
    TabRows,
} from "@/components/dashboard/tabs/types";
import {
    buildPermissionsIndex,
    hasAnyPermissionForEntity,
    hasPermissionForEntity,
} from "@/lib/permissions";

type TabConfig = {
    id: string;
    label: string;
    entity: string;
    endpoint: string;
    mapRow: (item: ApiRecord, index: number) => TabRowData;
};

type TabRowData = Record<string, string | number> & { id: string | number };

type ApiRecord = Record<string, unknown>;

type TabState = {
    rows: TabRows;
    error: string | null;
    loaded: boolean;
};

const resolveId = (item: Record<string, unknown>, fallback: number) => {
    const id = item.id ?? item._id ?? fallback;
    return typeof id === "string" || typeof id === "number" ? id : fallback;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return !!value && typeof value === "object" && !Array.isArray(value);
};

const toArray = (value: unknown): unknown[] => {
    return Array.isArray(value) ? value : [];
};

const collectLabels = (
    items: unknown,
    getter: (item: Record<string, unknown>) => unknown
) => {
    const labels = toArray(items)
        .map((item) => (isRecord(item) ? toLabel(getter(item)) : null))
        .filter(
            (label): label is string | number => label !== null && label !== ""
        )
        .map((label) => String(label));

    return labels.length ? labels.join(", ") : null;
};

const getProp = (value: unknown, key: string) => {
    if (!isRecord(value)) {
        return undefined;
    }

    return value[key];
};

const combineName = (first: unknown, last: unknown) => {
    const firstName = typeof first === "string" ? first.trim() : "";
    const lastName = typeof last === "string" ? last.trim() : "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName ? fullName : null;
};

const getObjectLabel = (value: Record<string, unknown>) => {
    const fullName = combineName(
        getProp(value, "firstName"),
        getProp(value, "lastName")
    );
    if (fullName) {
        return fullName;
    }
    if (typeof value.name === "string") {
        return value.name;
    }
    if (typeof value.email === "string") {
        return value.email;
    }
    if (typeof value.title === "string") {
        return value.title;
    }
    return null;
};

const toLabel = (value: unknown): string | number | null => {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === "string") {
        return value.trim() ? value : null;
    }
    if (typeof value === "number") {
        return value;
    }
    if (Array.isArray(value)) {
        const labels = value
            .map((item) => {
                if (typeof item === "string" || typeof item === "number") {
                    return String(item);
                }
                if (item && typeof item === "object") {
                    return getObjectLabel(item as Record<string, unknown>);
                }
                return null;
            })
            .filter(Boolean) as string[];

        return labels.length ? labels.join(", ") : null;
    }
    if (typeof value === "object") {
        return getObjectLabel(value as Record<string, unknown>);
    }
    return null;
};

const pickValue = (...values: unknown[]) => {
    for (const value of values) {
        const label = toLabel(value);
        if (label !== null && label !== "") {
            return label;
        }
    }
    return "-";
};

const formatDate = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
};

const booleanLabel = (value: unknown) => {
    if (typeof value === "boolean") {
        return value ? "Si" : "No";
    }
    if (typeof value === "string") {
        const normalized = value.toLowerCase();
        if (normalized === "true") {
            return "Si";
        }
        if (normalized === "false") {
            return "No";
        }
    }
    return pickValue(value);
};

const statusFromFlag = (
    value: unknown,
    whenTrue: string,
    whenFalse: string
) => {
    if (typeof value === "boolean") {
        return value ? whenTrue : whenFalse;
    }
    return null;
};

const normalizeLabel = (value: unknown) => {
    const label = toLabel(value);
    return label === null || label === "" ? null : String(label);
};

const getPersonLabel = (value: unknown) => {
    if (!isRecord(value)) {
        return null;
    }

    return normalizeLabel(getObjectLabel(value));
};

const formatAttendanceEntry = (entry: Record<string, unknown>) => {
    const studentLabel =
        getPersonLabel(getProp(entry, "student")) ??
        getPersonLabel(getProp(entry, "user"));
    const taLabel = getPersonLabel(getProp(entry, "ta"));

    if (studentLabel && taLabel) {
        return `${studentLabel} (TA: ${taLabel})`;
    }

    return studentLabel ?? taLabel;
};

const formatCourseUser = (entry: Record<string, unknown>) => {
    const name = normalizeLabel(
        combineName(getProp(entry, "firstName"), getProp(entry, "lastName")) ??
            getProp(entry, "name") ??
            getProp(entry, "email")
    );
    const relation = normalizeLabel(getProp(entry, "relationType"));

    if (name && relation) {
        return `${name} (${relation})`;
    }

    return name ?? relation;
};

const allTabs: TabConfig[] = [
    {
        id: "users",
        label: "Usuarios",
        entity: "users",
        endpoint: "/user",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Nombre: pickValue(
                    combineName(
                        getProp(data, "firstName"),
                        getProp(data, "lastName")
                    ),
                    data.name,
                    data.fullName,
                    data.username,
                    data.email
                ),
                Email: pickValue(data.email),
                Roles: pickValue(
                    data.roles,
                    collectLabels(data.userRoles, (entry) =>
                        getProp(entry, "role")
                    ),
                    data.role,
                    getProp(data.role, "name")
                ),
                Nivel: pickValue(data.level, data.academicLevel, data.semester),
            };
        },
    },
    {
        id: "roles",
        label: "Roles",
        entity: "roles",
        endpoint: "/role",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Rol: pickValue(data.name, data.role),
                Descripcion: pickValue(data.description, data.descripcion),
                Permisos: pickValue(
                    data.permissions,
                    collectLabels(data.rolesPermissions, (entry) =>
                        getProp(entry, "permission")
                    ),
                    collectLabels(data.rolePermissions, (entry) =>
                        getProp(entry, "permission")
                    )
                ),
            };
        },
    },
    {
        id: "permissions",
        label: "Permisos",
        entity: "permissions",
        endpoint: "/permission",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Nombre: pickValue(data.name, data.permission, data.action),
                Descripcion: pickValue(data.description, data.descripcion),
            };
        },
    },
    {
        id: "courses",
        label: "Cursos",
        entity: "courses",
        endpoint: "/courses",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Nombre: pickValue(data.name, data.title),
                Creditos: pickValue(data.credits, data.credit),
                Duracion: pickValue(data.duration, data.weeks),
                Inicio: formatDate(data.startDate ?? data.start),
                Usuarios: pickValue(
                    collectLabels(data.users, (entry) =>
                        isRecord(entry) ? formatCourseUser(entry) : null
                    ),
                    collectLabels(data.userCourses, (entry) =>
                        getProp(entry, "user")
                    ),
                    data.users,
                    data.students,
                    data.participants
                ),
            };
        },
    },
    {
        id: "supplementary_sessions",
        label: "Sesiones apoyo",
        entity: "supplementary_sessions",
        endpoint: "/supplementary-sessions",
        mapRow: (item, index) => {
            const data = item;
            const status = statusFromFlag(
                data.completed,
                "Completada",
                "Pendiente"
            );
            return {
                id: resolveId(data, index),
                Tema: pickValue(data.topic, data.theme, data.name),
                Fecha: formatDate(data.requestedDate ?? data.date),
                Virtual: booleanLabel(data.virtual),
                Estado: pickValue(data.status, status),
                Asistentes: pickValue(
                    collectLabels(data.attendees, (entry) =>
                        isRecord(entry) ? formatAttendanceEntry(entry) : null
                    ),
                    collectLabels(data.attendanceRecords, (entry) =>
                        isRecord(entry) ? formatAttendanceEntry(entry) : null
                    )
                ),
            };
        },
    },
    {
        id: "experience_badges",
        label: "Insignias",
        entity: "experience_badges",
        endpoint: "/experience-badge",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Insignia: pickValue(data.name, data.title),
                Nivel: pickValue(data.minLevel, data.level),
                Mensaje: pickValue(data.message),
            };
        },
    },
    {
        id: "user_badges",
        label: "Usuarios insignias",
        entity: "user_badges",
        endpoint: "/user-badge",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Usuario: pickValue(
                    getProp(data.user, "email"),
                    getProp(data.user, "name"),
                    data.userEmail
                ),
                Insignia: pickValue(
                    getProp(data.experienceBadge, "name"),
                    getProp(data.badge, "name"),
                    data.badgeName
                ),
                Fecha: formatDate(data.dateAcquired),
            };
        },
    },
    {
        id: "posts",
        label: "Posts",
        entity: "posts",
        endpoint: "/post",
        mapRow: (item, index) => {
            const data = item;
            const repliesCount =
                typeof data.repliesCount === "number"
                    ? data.repliesCount
                    : Array.isArray(data.replies)
                      ? data.replies.length
                      : data.replies;
            return {
                id: resolveId(data, index),
                Titulo: pickValue(data.title, data.question),
                Autor: pickValue(
                    getProp(data.user, "email"),
                    getProp(data.user, "name"),
                    data.userEmail,
                    data.author
                ),
                Respuestas: pickValue(repliesCount),
            };
        },
    },
    {
        id: "replies",
        label: "Respuestas",
        entity: "replies",
        endpoint: "/reply",
        mapRow: (item, index) => {
            const data = item;
            const status = statusFromFlag(
                data.validated,
                "Aprobada",
                "Pendiente"
            );
            return {
                id: resolveId(data, index),
                Post: pickValue(getProp(data.post, "title"), data.postTitle),
                Autor: pickValue(
                    getProp(data.user, "email"),
                    getProp(data.user, "name"),
                    data.userEmail,
                    data.author
                ),
                Aprobaciones: pickValue(data.approvals, data.likes),
                Estado: pickValue(data.status, status),
            };
        },
    },
    {
        id: "foro",
        label: "Foro",
        entity: "posts",
        endpoint: "/post",
        mapRow: (_item, index) => ({ id: index }),
    },
];

export default function DashboardPage() {
    const permissions = useAuthStore((state) => state.permissions);
    const roles = useAuthStore((state) => state.roles);
    const token = useAuthStore((state) => state.token);

    const isAdmin = roles.includes("Admin");

    const payload = useMemo(
        () => (token ? decodeJwtPayload(token) : null),
        [token]
    );
    const userId = payload?.sub ?? null;
    const userEmail = payload?.email ?? "";

    const permissionsIndex = useMemo(
        () => buildPermissionsIndex(permissions),
        [permissions]
    );

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [tabState, setTabState] = useState<Record<string, TabState>>(() =>
        Object.fromEntries(
            allTabs.map((tab) => [
                tab.id,
                { rows: [], error: null, loaded: false },
            ])
        )
    );

    const availableTabs = useMemo(() => {
        return allTabs
            .filter((tab) =>
                hasAnyPermissionForEntity(permissionsIndex, tab.entity)
            )
            .filter((tab) => {
                if (isAdmin) {
                    return tab.id !== "foro";
                }
                return tab.id !== "posts" && tab.id !== "replies";
            });
    }, [permissionsIndex, isAdmin]);

    const [selectedTabId, setSelectedTabId] = useState(
        availableTabs[0]?.id ?? ""
    );

    const activeTabId = useMemo(() => {
        if (!availableTabs.length) {
            return "";
        }

        if (availableTabs.some((tab) => tab.id === selectedTabId)) {
            return selectedTabId;
        }

        return availableTabs[0]?.id ?? "";
    }, [availableTabs, selectedTabId]);

    const selectedTab = availableTabs.find((tab) => tab.id === activeTabId);

    const sidebarItems: SidebarItemData[] = availableTabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
    }));

    const can = (
        entity: string,
        action: "create" | "read" | "update" | "delete"
    ) => hasPermissionForEntity(permissionsIndex, entity, action);

    const selectedTabState = selectedTab ? tabState[selectedTab.id] : undefined;
    const canRead = selectedTab ? can(selectedTab.entity, "read") : false;

    useEffect(() => {
        if (!selectedTab || !canRead) {
            return;
        }

        if (selectedTab.id === "foro") {
            return;
        }

        if (selectedTabState?.loaded) {
            return;
        }

        let isActive = true;

        apiService
            .get<Record<string, unknown>[]>(selectedTab.endpoint)
            .then((data) => {
                if (!isActive) {
                    return;
                }

                const items = Array.isArray(data) ? data : [];
                const rows = items.map((item, index) =>
                    selectedTab.mapRow(item ?? {}, index)
                );

                setTabState((prev) => ({
                    ...prev,
                    [selectedTab.id]: {
                        rows,
                        error: null,
                        loaded: true,
                    },
                }));
            })
            .catch(() => {
                if (!isActive) {
                    return;
                }

                setTabState((prev) => ({
                    ...prev,
                    [selectedTab.id]: {
                        ...prev[selectedTab.id],
                        error: "No se pudo cargar la informacion.",
                        loaded: true,
                    },
                }));
            });

        return () => {
            isActive = false;
        };
    }, [selectedTab, canRead, selectedTabState?.loaded]);

    const handleDelete = async (tabId: string, rowId: string | number) => {
        const tab = allTabs.find((item) => item.id === tabId);
        if (!tab) {
            return;
        }

        await apiService.delete(`${tab.endpoint}/${rowId}`);
        setTabState((prev) => ({
            ...prev,
            [tabId]: {
                ...prev[tabId],
                rows: prev[tabId].rows.filter((row) => row.id !== rowId),
            },
        }));
    };

    const tabComponents: Record<
        string,
        (props: EntityTabProps) => ReactElement
    > = useMemo(
        () => ({
            users: UsersTab,
            roles: RolesTab,
            permissions: PermissionsTab,
            courses: isAdmin ? CoursesTab : CoursesCardTab,
            supplementary_sessions: SupplementarySessionsTab,
            experience_badges: isAdmin ? ExperienceBadgesTab : BadgesGridTab,
            user_badges: UserBadgesTab,
            posts: PostsTab,
            replies: RepliesTab,
        }),
        [isAdmin]
    );

    const renderTab = () => {
        if (!selectedTab) {
            return (
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <p className="text-slate-600">
                        No tienes permisos asignados todavia.
                    </p>
                </div>
            );
        }

        if (selectedTab.id === "foro") {
            return (
                <ForumTab
                    roles={roles}
                    canCreate={can("posts", "create") || can("replies", "create")}
                />
            );
        }

        const rows = selectedTabState?.rows ?? [];
        const isLoading = canRead && !(selectedTabState?.loaded ?? false);
        const emptyMessage = !canRead
            ? "No tienes permiso para ver estos registros."
            : (selectedTabState?.error ?? "Sin registros por ahora.");
        const canCreate = can(selectedTab.entity, "create");
        const canUpdate = can(selectedTab.entity, "update");
        const canDelete = can(selectedTab.entity, "delete");
        const TabComponent = tabComponents[selectedTab.id];

        if (!TabComponent) {
            return null;
        }

        return (
            <TabComponent
                rows={rows}
                canCreate={canCreate}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onDelete={(rowId) => handleDelete(selectedTab.id, rowId)}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
            />
        );
    };

    return (
        <div className="min-h-screen bg-(--blue-50)">
            <ProfileModal
                isOpen={profileOpen}
                userId={userId}
                userEmail={userEmail}
                roles={roles}
                onClose={() => setProfileOpen(false)}
            />

            <div className="flex">
                <Sidebar
                    isOpen={sidebarOpen}
                    isCollapsed={sidebarCollapsed}
                    items={sidebarItems}
                    selectedId={activeTabId}
                    onSelect={(id) => {
                        setSelectedTabId(id);
                        setSidebarOpen(false);
                    }}
                    onToggleCollapse={() =>
                        setSidebarCollapsed((prev) => !prev)
                    }
                />

                <div
                    className={`flex-1 min-h-screen ml-0 transition-all ${
                        sidebarCollapsed ? "md:ml-20" : "md:ml-64"
                    }`}
                >
                    <AppHeader
                        tabLabel={selectedTab?.label ?? "Inicio"}
                        userName={userEmail}
                        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
                        onProfileOpen={() => setProfileOpen(true)}
                    />

                    <main className="max-w-6xl mx-auto px-6 py-8">
                        {renderTab()}
                    </main>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify TypeScript build passes**

```bash
cd nextJs-scholar-sync/scholar-sync && bun run build 2>&1
```

Expected: successful build, no TypeScript errors.

- [ ] **Step 3: Start dev server and verify manually**

```bash
cd nextJs-scholar-sync/scholar-sync && bun run dev
```

Open `http://localhost:3001`. Log in as `dave@example.com` (Admin, password `Password123`). Verify:
- Header shows email + avatar button
- Posts and Respuestas tabs visible in sidebar
- Click avatar → ProfileModal opens with dave's info
- Escape key closes modal

Log in as `alice@example.com` (Student):
- Sidebar shows "Foro" instead of Posts/Replies
- Cursos tab shows cards, not table
- Insignias tab shows badge grid
- Click a post → thread view opens
- "← Volver" returns to list

- [ ] **Step 4: Commit**

```bash
git add nextJs-scholar-sync/scholar-sync/app/dashboard/page.tsx
git commit -m "feat: integrate forum, profile modal, and non-admin card views"
```
