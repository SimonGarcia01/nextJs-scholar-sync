"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setAuthToken } from "@/lib/axios";

type AuthState = {
    token: string | null;
    setToken: (token: string | null) => void;
    clearAuth: () => void;
};

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            setToken: (token) => {
                setAuthToken(token);
                set({ token });
            },
            clearAuth: () => {
                setAuthToken(null);
                set({ token: null });
            },
        }),
        {
            name: "scholar-sync-auth",
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state?.token) {
                    setAuthToken(state.token);
                }
            },
        }
    )
);

export default useAuthStore;
