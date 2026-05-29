import { useState } from "react";
import EntityFormModal, {
    FieldConfig,
} from "@/components/dashboard/EntityFormModal";
import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";
import apiService from "@/lib/apiService";

const BADGE_FIELDS: FieldConfig[] = [
    { name: "name", label: "Insignia", required: true },
    { name: "minLevel", label: "Nivel minimo", type: "number", required: true },
    { name: "message", label: "Mensaje", required: true },
];

type BadgeRow = Record<string, string | number> & { id: string | number };

export default function ExperienceBadgesTab({
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
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [initialValues, setInitialValues] = useState<
        Record<string, string> | undefined
    >(undefined);

    const handleCreate = () => {
        setEditingId(null);
        setInitialValues(undefined);
        setModalOpen(true);
    };

    const handleEdit = async (row: BadgeRow) => {
        setEditingId(row.id);
        try {
            const data = await apiService.get<Record<string, unknown>>(
                `/experience-badge/${row.id}`
            );
            setInitialValues({
                name: String(data.name ?? row.Insignia ?? ""),
                minLevel: String(data.minLevel ?? row.Nivel ?? ""),
                message: String(data.message ?? row.Mensaje ?? ""),
            });
        } catch {
            setInitialValues({
                name: String(row.Insignia ?? ""),
                minLevel: String(row.Nivel ?? ""),
                message: String(row.Mensaje ?? ""),
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (values: Record<string, string>) => {
        const payload = {
            name: values.name,
            minLevel: Number(values.minLevel),
            message: values.message,
        };

        if (editingId !== null) {
            await apiService.patch(`/experience-badge/${editingId}`, payload);
        } else {
            await apiService.post("/experience-badge", payload);
        }

        await onRefresh?.();
    };

    return (
        <>
            <EntityFormModal
                isOpen={modalOpen}
                title={editingId !== null ? "Editar insignia" : "Crear insignia"}
                fields={BADGE_FIELDS}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
            />
            <TablePanel
                title="Insignias"
                description="Catalogo de insignias de experiencia."
                columns={["Insignia", "Nivel", "Mensaje"]}
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
