"use client";

import { MenuIcon } from "@/components/dashboard/Icons";

type AppHeaderProps = {
    tabLabel: string;
    userName: string;
    onMenuToggle: () => void;
    onProfileOpen: () => void;
    onLogout: () => void;
};

export default function AppHeader({
    tabLabel,
    userName,
    onMenuToggle,
    onProfileOpen,
    onLogout,
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

                <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    aria-label="Cerrar sesion"
                >
                    Salir
                </button>
            </div>
        </header>
    );
}
