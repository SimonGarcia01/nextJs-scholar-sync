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
