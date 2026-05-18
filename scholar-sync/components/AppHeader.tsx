"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/_store/authStore";

export default function AppHeader() {
    const router = useRouter();
    const { token, clearAuth } = useAuthStore();

    return (
        <header className="w-full header text-white">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="text-xl font-semibold">
                    Scholar Sync
                </Link>
                <nav className="flex items-center gap-4 text-sm">
                    {token ? (
                        <button
                            type="button"
                            onClick={() => {
                                clearAuth();
                                router.push("/");
                            }}
                            className="nav-pill nav-pill--light"
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link href="/login" className="nav-pill">
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="nav-pill nav-pill--light"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
