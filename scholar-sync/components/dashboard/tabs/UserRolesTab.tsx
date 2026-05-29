import { useEffect, useState } from "react";
import EntityFormModal, {
    FieldConfig,
} from "@/components/dashboard/EntityFormModal";
import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";
import apiService from "@/lib/apiService";

type SelectOption = { value: string; label: string };

const toOptions = (
    data: unknown,
    labelKeys: string[]
): SelectOption[] => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item, index) => {
            if (!item || typeof item !== "object") {
                return null;
            }

            const record = item as Record<string, unknown>;
            const rawId = record.id ?? record._id ?? index;
            const value = String(rawId);
            const labelValue = labelKeys.find(
                (key) =>
                    typeof record[key] === "string" &&
                    String(record[key]).trim() !== ""
            );

            if (!labelValue) {
                return null;
            }

            return { value, label: String(record[labelValue]) };
        })
        .filter((option): option is SelectOption => option !== null);
};

export default function UserRolesTab({
    rows,
    canCreate,
    canDelete,
    onRefresh,
    onDelete,
    isLoading,
    emptyMessage,
}: EntityTabProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRow, setEditingRow] =
        useState<Record<string, string> | null>(null);
    const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
    const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        apiService
            .get<unknown>("/user")
            .then((data) => setUserOptions(toOptions(data, ["email", "name"])))
            .catch(() => setUserOptions([]));

        apiService
            .get<unknown>("/role")
            .then((data) => setRoleOptions(toOptions(data, ["name", "role"])))
            .catch(() => setRoleOptions([]));
    }, []);

    const handleCreate = () => {
        setEditingRow(null);
        setModalOpen(true);
    };

    const handleSubmit = async (values: Record<string, string>) => {
        await apiService.post("/user-role", {
            userId: Number(values.userId),
            roleId: Number(values.roleId),
        });
        await onRefresh?.();
    };

    const USER_ROLE_FIELDS: FieldConfig[] = [
        {
            name: "userId",
            label: "Usuario",
            required: true,
            options: userOptions,
        },
        {
            name: "roleId",
            label: "Rol",
            required: true,
            options: roleOptions,
        },
    ];

    return (
        <>
            <EntityFormModal
                isOpen={modalOpen}
                title="Crear asignacion usuario-rol"
                fields={USER_ROLE_FIELDS}
                initialValues={editingRow ?? undefined}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
            />

            <TablePanel
                title="Usuarios y roles"
                description="Asignaciones de roles a usuarios."
                columns={["Usuario", "Rol"]}
                rows={rows}
                canCreate={canCreate}
                canUpdate={false}
                canDelete={canDelete}
                onCreate={handleCreate}
                onDelete={onDelete}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
            />
        </>
    );
}
