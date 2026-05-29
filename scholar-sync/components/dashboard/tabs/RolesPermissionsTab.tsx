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

export default function RolesPermissionsTab({
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
    const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
    const [permissionOptions, setPermissionOptions] = useState<SelectOption[]>(
        []
    );

    useEffect(() => {
        apiService
            .get<unknown>("/role")
            .then((data) => setRoleOptions(toOptions(data, ["name", "role"])))
            .catch(() => setRoleOptions([]));

        apiService
            .get<unknown>("/permission")
            .then((data) =>
                setPermissionOptions(toOptions(data, ["name", "permission"]))
            )
            .catch(() => setPermissionOptions([]));
    }, []);

    const handleCreate = () => {
        setEditingRow(null);
        setModalOpen(true);
    };

    const handleSubmit = async (values: Record<string, string>) => {
        await apiService.post("/role-permission", {
            roleId: Number(values.roleId),
            permissionId: Number(values.permissionId),
        });
        await onRefresh?.();
    };

    const ROLE_PERMISSION_FIELDS: FieldConfig[] = [
        {
            name: "roleId",
            label: "Rol",
            required: true,
            options: roleOptions,
        },
        {
            name: "permissionId",
            label: "Permiso",
            required: true,
            options: permissionOptions,
        },
    ];

    return (
        <>
            <EntityFormModal
                isOpen={modalOpen}
                title="Crear relacion rol-permiso"
                fields={ROLE_PERMISSION_FIELDS}
                initialValues={editingRow ?? undefined}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
            />

            <TablePanel
                title="Roles permisos"
                description="Relacion rol y permiso."
                columns={["Rol", "Permiso"]}
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
