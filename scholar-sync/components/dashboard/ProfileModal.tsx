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
                          const entryUserId = (
                              entry as Record<string, unknown> & {
                                  user?: { id?: number };
                              }
                          ).user?.id;
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
