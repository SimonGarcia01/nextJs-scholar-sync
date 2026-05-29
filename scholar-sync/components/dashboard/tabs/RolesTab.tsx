import { useState } from "react";
import EntityFormModal, {
    FieldConfig,
} from "@/components/dashboard/EntityFormModal";
import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";
import apiService from "@/lib/apiService";

const ROLE_FIELDS: FieldConfig[] = [
    { name: "name", label: "Nombre", required: true },
    { name: "description", label: "Descripcion" },
];

type RoleRow = Record<string, string | number> & { id: string | number };

export default function RolesTab({
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onRefresh,
    onDelete,
    isLoading,
    emptyMessage,
}: EntityTabProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRow, setEditingRow] =
        useState<Record<string, string> | null>(null);
    const [editingId, setEditingId] = useState<string | number | null>(null);

    const handleCreate = () => {
        setEditingRow(null);
        setEditingId(null);
        setModalOpen(true);
    };

    const handleEdit = (row: RoleRow) => {
        setEditingRow({
            name: String(row["Rol"] ?? ""),
            description: String(row["Descripcion"] ?? ""),
        });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleSubmit = async (values: Record<string, string>) => {
        if (editingId !== null) {
            await apiService.patch(`/role/${editingId}`, values);
        } else {
            await apiService.post("/role", values);
        }
        await onRefresh?.();
    };

    return (
        <>
            <EntityFormModal
                isOpen={modalOpen}
                title={editingId !== null ? "Editar rol" : "Crear rol"}
                fields={ROLE_FIELDS}
                initialValues={editingRow ?? undefined}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
            />

            <TablePanel
                title="Roles"
                description="Control de acceso del sistema."
                columns={["Rol", "Descripcion", "Permisos"]}
                rows={rows}
                canCreate={canCreate}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={onDelete}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
            />
        </>
    );
}
