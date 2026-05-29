import { useState } from "react";
import EntityFormModal, {
    FieldConfig,
} from "@/components/dashboard/EntityFormModal";
import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";
import apiService from "@/lib/apiService";

const SESSION_FIELDS: FieldConfig[] = [
    { name: "topic", label: "Tema", required: true },
    { name: "requestedDate", label: "Fecha", type: "date", required: true },
    {
        name: "virtual",
        label: "Virtual",
        required: true,
        options: [
            { value: "true", label: "Si" },
            { value: "false", label: "No" },
        ],
    },
    { name: "status", label: "Estado", required: true },
];

type SessionRow = Record<string, string | number> & { id: string | number };

export default function SupplementarySessionsTab({
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

    const handleEdit = async (row: SessionRow) => {
        setEditingId(row.id);
        try {
            const data = await apiService.get<Record<string, unknown>>(
                `/supplementary-sessions/${row.id}`
            );
            setInitialValues({
                topic: String(data.topic ?? row.Tema ?? ""),
                requestedDate: String(data.requestedDate ?? "").slice(0, 10),
                virtual: String(Boolean(data.virtual)),
                status: String(data.status ?? row.Estado ?? ""),
            });
        } catch {
            setInitialValues({
                topic: String(row.Tema ?? ""),
                requestedDate: "",
                virtual: "false",
                status: String(row.Estado ?? ""),
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (values: Record<string, string>) => {
        const payload = {
            topic: values.topic,
            requestedDate: values.requestedDate,
            virtual: values.virtual === "true",
            status: values.status,
        };

        if (editingId !== null) {
            await apiService.patch(`/supplementary-sessions/${editingId}`, payload);
        } else {
            await apiService.post("/supplementary-sessions", payload);
        }

        await onRefresh?.();
    };

    return (
        <>
            <EntityFormModal
                isOpen={modalOpen}
                title={
                    editingId !== null
                        ? "Editar sesion de apoyo"
                        : "Crear sesion de apoyo"
                }
                fields={SESSION_FIELDS}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
            />
            <TablePanel
                title="Sesiones de apoyo"
                description="Sesiones de apoyo academico."
                columns={["Tema", "Fecha", "Virtual", "Estado", "Asistentes"]}
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
