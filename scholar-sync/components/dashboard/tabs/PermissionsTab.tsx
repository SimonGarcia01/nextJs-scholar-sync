import { useState } from "react";
import EntityFormModal, {
    FieldConfig,
} from "@/components/dashboard/EntityFormModal";
import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";
import apiService from "@/lib/apiService";

const PERMISSION_FIELDS: FieldConfig[] = [
    { name: "name", label: "Nombre", required: true },
    { name: "description", label: "Descripcion" },
];

type PermissionRow = Record<string, string | number> & { id: string | number };

export default function PermissionsTab({
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

    const handleEdit = (row: PermissionRow) => {
        setEditingRow({
            name: String(row["Nombre"] ?? ""),
            description: String(row["Descripcion"] ?? ""),
        });
        setEditingId(row.id);
        setModalOpen(true);
    };

    const handleSubmit = async (values: Record<string, string>) => {
        if (editingId !== null) {
            await apiService.patch(`/permission/${editingId}`, values);
        } else {
            await apiService.post("/permission", values);
        }
        await onRefresh?.();
    };

    return (
        <>
            <EntityFormModal
                isOpen={modalOpen}
                title={editingId !== null ? "Editar permiso" : "Crear permiso"}
                fields={PERMISSION_FIELDS}
                initialValues={editingRow ?? undefined}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
            />

            <TablePanel
                title="Permisos"
                description="Lista de permisos disponibles."
                columns={["Nombre", "Descripcion"]}
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
