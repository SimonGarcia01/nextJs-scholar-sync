"use client";

import { useMemo, useState } from "react";
import Sidebar, { SidebarItemData } from "@/components/dashboard/Sidebar";
import UsersTab from "@/components/dashboard/tabs/UsersTab";
import RolesTab from "@/components/dashboard/tabs/RolesTab";
import PermissionsTab from "@/components/dashboard/tabs/PermissionsTab";
import RolesPermissionsTab from "@/components/dashboard/tabs/RolesPermissionsTab";
import UserRolesTab from "@/components/dashboard/tabs/UserRolesTab";
import CoursesTab from "@/components/dashboard/tabs/CoursesTab";
import UserCoursesTab from "@/components/dashboard/tabs/UserCoursesTab";
import SupplementarySessionsTab from "@/components/dashboard/tabs/SupplementarySessionsTab";
import AttendanceSuppSessionsTab from "@/components/dashboard/tabs/AttendanceSuppSessionsTab";
import ExperienceBadgesTab from "@/components/dashboard/tabs/ExperienceBadgesTab";
import UserBadgesTab from "@/components/dashboard/tabs/UserBadgesTab";
import PostsTab from "@/components/dashboard/tabs/PostsTab";
import RepliesTab from "@/components/dashboard/tabs/RepliesTab";
import { MenuIcon } from "@/components/dashboard/Icons";
import apiService from "@/lib/apiService";
import useAuthStore from "@/_store/authStore";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";
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
    rows: (Record<string, string | number> & { id: string | number })[];
};

const tabs: TabConfig[] = [
    {
        id: "users",
        label: "Usuarios",
        entity: "users",
        endpoint: "/user",
        rows: [
            {
                id: 1,
                Nombre: "Alice Smith",
                Email: "alice@example.com",
                Rol: "Student",
                Nivel: 2,
            },
            {
                id: 2,
                Nombre: "Dave Admin",
                Email: "dave@example.com",
                Rol: "Admin",
                Nivel: 5,
            },
        ],
    },
    {
        id: "roles",
        label: "Roles",
        entity: "roles",
        endpoint: "/role",
        rows: [
            {
                id: 3,
                Rol: "Admin",
                Descripcion: "Acceso total",
            },
            {
                id: 4,
                Rol: "Student",
                Descripcion: "Acceso de lectura",
            },
        ],
    },
    {
        id: "permissions",
        label: "Permisos",
        entity: "permissions",
        endpoint: "/permission",
        rows: [
            {
                id: 5,
                Nombre: "Read users",
                Descripcion: "Can read users",
            },
            {
                id: 6,
                Nombre: "Create courses",
                Descripcion: "Can create courses",
            },
        ],
    },
    {
        id: "roles_permissions",
        label: "Roles permisos",
        entity: "roles_permissions",
        endpoint: "/role-permission",
        rows: [
            {
                id: 7,
                Rol: "Admin",
                Permiso: "Create users",
            },
            {
                id: 8,
                Rol: "Student",
                Permiso: "Read posts",
            },
        ],
    },
    {
        id: "user_roles",
        label: "Usuarios roles",
        entity: "user_roles",
        endpoint: "/user-role",
        rows: [
            {
                id: 9,
                Usuario: "dave@example.com",
                Rol: "Admin",
            },
            {
                id: 10,
                Usuario: "alice@example.com",
                Rol: "Student",
            },
        ],
    },
    {
        id: "courses",
        label: "Cursos",
        entity: "courses",
        endpoint: "/courses",
        rows: [
            {
                id: 11,
                Nombre: "Intro SE",
                Creditos: 3,
                Duracion: 16,
                Inicio: "2026-08-01",
            },
            {
                id: 12,
                Nombre: "Physics I",
                Creditos: 4,
                Duracion: 16,
                Inicio: "2026-08-01",
            },
        ],
    },
    {
        id: "user_courses",
        label: "Usuarios cursos",
        entity: "user_courses",
        endpoint: "/user-course",
        rows: [
            {
                id: 13,
                Usuario: "alice@example.com",
                Curso: "Intro SE",
                Tipo: "student",
            },
            {
                id: 14,
                Usuario: "bob@example.com",
                Curso: "Physics I",
                Tipo: "student",
            },
        ],
    },
    {
        id: "supplementary_sessions",
        label: "Sesiones apoyo",
        entity: "supplementary_sessions",
        endpoint: "/supplementary-sessions",
        rows: [
            {
                id: 15,
                Tema: "Algebra",
                Fecha: "2026-05-01",
                Virtual: "Si",
                Estado: "Pendiente",
            },
            {
                id: 16,
                Tema: "Calculo",
                Fecha: "2026-05-02",
                Virtual: "No",
                Estado: "Confirmada",
            },
        ],
    },
    {
        id: "attendance_supp_sessions",
        label: "Asistencias",
        entity: "attendance_supp_sessions",
        endpoint: "/attendance-supp-session",
        rows: [
            {
                id: 17,
                Sesion: "Algebra",
                TA: "dave@example.com",
                Estudiante: "alice@example.com",
                Notas: "A tiempo",
            },
            {
                id: 18,
                Sesion: "Calculo",
                TA: "carol@example.com",
                Estudiante: "bob@example.com",
                Notas: "Tarde",
            },
        ],
    },
    {
        id: "experience_badges",
        label: "Insignias",
        entity: "experience_badges",
        endpoint: "/experience-badge",
        rows: [
            {
                id: 19,
                Insignia: "Novice",
                Nivel: 1,
                Mensaje: "Welcome rookie",
            },
            {
                id: 20,
                Insignia: "Intermediate",
                Nivel: 3,
                Mensaje: "Keep going",
            },
        ],
    },
    {
        id: "user_badges",
        label: "Usuarios insignias",
        entity: "user_badges",
        endpoint: "/user-badge",
        rows: [
            {
                id: 21,
                Usuario: "alice@example.com",
                Insignia: "Novice",
                Fecha: "2026-04-26",
            },
            {
                id: 22,
                Usuario: "bob@example.com",
                Insignia: "Intermediate",
                Fecha: "2026-04-30",
            },
        ],
    },
    {
        id: "posts",
        label: "Posts",
        entity: "posts",
        endpoint: "/post",
        rows: [
            {
                id: 23,
                Titulo: "Help with homework",
                Autor: "alice@example.com",
                Respuestas: 3,
            },
            {
                id: 24,
                Titulo: "Derivadas",
                Autor: "bob@example.com",
                Respuestas: 1,
            },
        ],
    },
    {
        id: "replies",
        label: "Respuestas",
        entity: "replies",
        endpoint: "/reply",
        rows: [
            {
                id: 25,
                Post: "Help with homework",
                Autor: "carol@example.com",
                Aprobaciones: 1,
                Estado: "Pendiente",
            },
            {
                id: 26,
                Post: "Derivadas",
                Autor: "bob@example.com",
                Aprobaciones: 3,
                Estado: "Aprobada",
            },
        ],
    },
];

const tabComponents: Record<string, (props: EntityTabProps) => JSX.Element> = {
    users: UsersTab,
    roles: RolesTab,
    permissions: PermissionsTab,
    roles_permissions: RolesPermissionsTab,
    user_roles: UserRolesTab,
    courses: CoursesTab,
    user_courses: UserCoursesTab,
    supplementary_sessions: SupplementarySessionsTab,
    attendance_supp_sessions: AttendanceSuppSessionsTab,
    experience_badges: ExperienceBadgesTab,
    user_badges: UserBadgesTab,
    posts: PostsTab,
    replies: RepliesTab,
};

export default function DashboardPage() {
    const permissions = useAuthStore((state) => state.permissions);
    const permissionsIndex = useMemo(
        () => buildPermissionsIndex(permissions),
        [permissions]
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tabRows, setTabRows] = useState(() =>
        Object.fromEntries(tabs.map((tab) => [tab.id, tab.rows]))
    );

    const availableTabs = useMemo(() => {
        return tabs.filter((tab) =>
            hasAnyPermissionForEntity(permissionsIndex, tab.entity)
        );
    }, [permissionsIndex]);

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

    const handleDelete = async (tabId: string, rowId: string | number) => {
        const tab = tabs.find((item) => item.id === tabId);
        if (!tab) {
            return;
        }

        await apiService.delete(`${tab.endpoint}/${rowId}`);
        setTabRows((prev) => ({
            ...prev,
            [tabId]: prev[tabId].filter((row) => row.id !== rowId),
        }));
    };

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

        const rows = tabRows[selectedTab.id] ?? [];
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
            />
        );
    };

    return (
        <div className="min-h-screen bg-[var(--blue-50)]">
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
                    <header className="sticky top-0 z-10 bg-[var(--blue-50)]/90 backdrop-blur border-b border-slate-200">
                        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen((prev) => !prev)}
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
                                    {selectedTab?.label ?? "Inicio"}
                                </h1>
                            </div>
                        </div>
                    </header>

                    <main className="max-w-6xl mx-auto px-6 py-8">
                        {renderTab()}
                    </main>
                </div>
            </div>
        </div>
    );
}
