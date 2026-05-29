"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Sidebar, { SidebarItemData } from "@/components/dashboard/Sidebar";
import AppHeader from "@/components/dashboard/AppHeader";
import ProfileModal from "@/components/dashboard/ProfileModal";
import UsersTab from "@/components/dashboard/tabs/UsersTab";
import RolesTab from "@/components/dashboard/tabs/RolesTab";
import PermissionsTab from "@/components/dashboard/tabs/PermissionsTab";
import RolesPermissionsTab from "@/components/dashboard/tabs/RolesPermissionsTab";
import CoursesTab from "@/components/dashboard/tabs/CoursesTab";
import CoursesCardTab from "@/components/dashboard/tabs/CoursesCardTab";
import SupplementarySessionsTab from "@/components/dashboard/tabs/SupplementarySessionsTab";
import ExperienceBadgesTab from "@/components/dashboard/tabs/ExperienceBadgesTab";
import BadgesGridTab from "@/components/dashboard/tabs/BadgesGridTab";
import UserBadgesTab from "@/components/dashboard/tabs/UserBadgesTab";
import UserRolesTab from "@/components/dashboard/tabs/UserRolesTab";
import UserCoursesTab from "@/components/dashboard/tabs/UserCoursesTab";
import AttendanceSuppSessionsTab from "@/components/dashboard/tabs/AttendanceSuppSessionsTab";
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

export const resolveId = (item: Record<string, unknown>, fallback: number) => {
    const id = item.id ?? item._id ?? fallback;
    return typeof id === "string" || typeof id === "number" ? id : fallback;
};

export const isRecord = (value: unknown): value is Record<string, unknown> => {
    return !!value && typeof value === "object" && !Array.isArray(value);
};

export const toArray = (value: unknown): unknown[] => {
    return Array.isArray(value) ? value : [];
};

export const collectLabels = (
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

export const getProp = (value: unknown, key: string) => {
    if (!isRecord(value)) {
        return undefined;
    }

    return value[key];
};

export const combineName = (first: unknown, last: unknown) => {
    const firstName = typeof first === "string" ? first.trim() : "";
    const lastName = typeof last === "string" ? last.trim() : "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName ? fullName : null;
};

export const getObjectLabel = (value: Record<string, unknown>) => {
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

export const toLabel = (value: unknown): string | number | null => {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === "string") {
        return value.trim() ? value.trim() : null;
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

export const pickValue = (...values: unknown[]) => {
    for (const value of values) {
        const label = toLabel(value);
        if (label !== null && label !== "") {
            return label;
        }
    }
    return "-";
};

export const formatDate = (value: unknown) => {
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

export const booleanLabel = (value: unknown) => {
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

export const statusFromFlag = (
    value: unknown,
    whenTrue: string,
    whenFalse: string
) => {
    if (typeof value === "boolean") {
        return value ? whenTrue : whenFalse;
    }
    return null;
};

export const normalizeLabel = (value: unknown) => {
    const label = toLabel(value);
    return label === null || label === "" ? null : String(label);
};

export const getPersonLabel = (value: unknown) => {
    if (!isRecord(value)) {
        return null;
    }

    return normalizeLabel(getObjectLabel(value));
};

export const formatAttendanceEntry = (entry: Record<string, unknown>) => {
    const studentLabel =
        getPersonLabel(getProp(entry, "student")) ??
        getPersonLabel(getProp(entry, "user"));
    const taLabel = getPersonLabel(getProp(entry, "ta"));

    if (studentLabel && taLabel) {
        return `${studentLabel} (TA: ${taLabel})`;
    }

    return studentLabel ?? taLabel;
};

export const formatCourseUser = (entry: Record<string, unknown>) => {
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
        id: "roles_permissions",
        label: "Roles y permisos",
        entity: "roles_permissions",
        endpoint: "/role-permission",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Rol: pickValue(
                    getProp(data.role, "name"),
                    data.roleName,
                    data.role
                ),
                Permiso: pickValue(
                    getProp(data.permission, "name"),
                    data.permissionName,
                    data.permission
                ),
            };
        },
    },
    {
        id: "user_roles",
        label: "Usuarios y roles",
        entity: "user_roles",
        endpoint: "/user-role",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Usuario: pickValue(
                    getProp(data.user, "email"),
                    getProp(data.user, "name"),
                    data.userEmail,
                    data.user
                ),
                Rol: pickValue(
                    getProp(data.role, "name"),
                    data.roleName,
                    data.role
                ),
            };
        },
    },
    {
        id: "user_courses",
        label: "Usuarios y cursos",
        entity: "user_courses",
        endpoint: "/user-course",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Usuario: pickValue(
                    getProp(data.user, "email"),
                    combineName(
                        getProp(getProp(data, "user"), "firstName"),
                        getProp(getProp(data, "user"), "lastName")
                    ),
                    getProp(data.user, "name"),
                    data.userEmail,
                    data.user
                ),
                Curso: pickValue(
                    getProp(data.course, "name"),
                    getProp(data.course, "title"),
                    data.courseName,
                    data.course
                ),
                Tipo: pickValue(data.relationType, data.type, data.role),
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
        id: "attendance_supp_sessions",
        label: "Asistencia sesiones",
        entity: "attendance_supp_sessions",
        endpoint: "/attendance-supp-session",
        mapRow: (item, index) => {
            const data = item;
            return {
                id: resolveId(data, index),
                Sesion: pickValue(
                    getProp(data.supplementarySession, "topic"),
                    getProp(data.supplementarySession, "name"),
                    getProp(data.session, "topic"),
                    data.sessionTopic,
                    data.session
                ),
                TA: pickValue(
                    combineName(
                        getProp(getProp(data, "ta"), "firstName"),
                        getProp(getProp(data, "ta"), "lastName")
                    ),
                    getProp(data.ta, "email"),
                    getProp(data.ta, "name"),
                    data.taEmail,
                    data.ta
                ),
                Estudiante: pickValue(
                    combineName(
                        getProp(getProp(data, "student"), "firstName"),
                        getProp(getProp(data, "student"), "lastName")
                    ),
                    getProp(data.student, "email"),
                    getProp(data.student, "name"),
                    data.studentEmail,
                    data.student
                ),
                Notas: pickValue(data.notes, data.note, data.comments),
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
    const router = useRouter();
    const permissions = useAuthStore((state) => state.permissions);
    const roles = useAuthStore((state) => state.roles);
    const token = useAuthStore((state) => state.token);
    const clearAuth = useAuthStore((state) => state.clearAuth);

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

    const handleRefreshTab = async (tabId: string) => {
        const tab = allTabs.find((item) => item.id === tabId);
        if (!tab) {
            return;
        }

        try {
            const data = await apiService.get<Record<string, unknown>[]>(
                tab.endpoint
            );
            const items = Array.isArray(data) ? data : [];
            const rows = items.map((item, index) => tab.mapRow(item ?? {}, index));

            setTabState((prev) => ({
                ...prev,
                [tabId]: {
                    rows,
                    error: null,
                    loaded: true,
                },
            }));
        } catch {
            setTabState((prev) => ({
                ...prev,
                [tabId]: {
                    ...prev[tabId],
                    error: "No se pudo cargar la informacion.",
                    loaded: true,
                },
            }));
        }
    };

    const handleLogout = () => {
        clearAuth();
        router.push("/login");
    };

    const tabComponents: Record<
        string,
        (props: EntityTabProps) => ReactElement
    > = useMemo(
        () => ({
            users: UsersTab,
            roles: RolesTab,
            permissions: PermissionsTab,
            roles_permissions: RolesPermissionsTab,
            user_roles: UserRolesTab,
            user_courses: UserCoursesTab,
            courses: isAdmin ? CoursesTab : CoursesCardTab,
            supplementary_sessions: SupplementarySessionsTab,
            attendance_supp_sessions: AttendanceSuppSessionsTab,
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
                    canCreatePost={can("posts", "create")}
                    canCreateReply={can("replies", "create")}
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
                onRefresh={() => handleRefreshTab(selectedTab.id)}
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
                        onLogout={handleLogout}
                    />

                    <main className="max-w-6xl mx-auto px-6 py-8">
                        {renderTab()}
                    </main>
                </div>
            </div>
        </div>
    );
}
