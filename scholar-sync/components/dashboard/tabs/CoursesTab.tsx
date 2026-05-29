import { useState } from "react";
import EntityFormModal, {
    FieldConfig,
} from "@/components/dashboard/EntityFormModal";
import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";
import apiService from "@/lib/apiService";

const COURSE_FIELDS: FieldConfig[] = [
    { name: "name", label: "Nombre", required: true },
    { name: "credits", label: "Creditos", type: "number", required: true },
    { name: "duration", label: "Duracion", required: true },
    { name: "startDate", label: "Fecha inicio", type: "date", required: true },
];

type CourseRow = Record<string, string | number> & { id: string | number };

export default function CoursesTab({
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

    const handleEdit = async (row: CourseRow) => {
        setEditingId(row.id);
        try {
            const data = await apiService.get<Record<string, unknown>>(
                `/courses/${row.id}`
            );
            setInitialValues({
                name: String(data.name ?? row.Nombre ?? ""),
                credits: String(data.credits ?? row.Creditos ?? ""),
                duration: String(data.duration ?? row.Duracion ?? ""),
                startDate: String(data.startDate ?? "").slice(0, 10),
            });
        } catch {
            setInitialValues({
                name: String(row.Nombre ?? ""),
                credits: String(row.Creditos ?? ""),
                duration: String(row.Duracion ?? ""),
                startDate: "",
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (values: Record<string, string>) => {
        const payload = {
            name: values.name,
            credits: Number(values.credits),
            duration: values.duration,
            startDate: values.startDate,
        };

        if (editingId !== null) {
            await apiService.patch(`/courses/${editingId}`, payload);
        } else {
            await apiService.post("/courses", payload);
        }

        await onRefresh?.();
    };

    return (
        <>
            <EntityFormModal
                isOpen={modalOpen}
                title={editingId !== null ? "Editar curso" : "Crear curso"}
                fields={COURSE_FIELDS}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
            />
            <TablePanel
                title="Cursos"
                description="Materias activas del semestre."
                columns={["Nombre", "Creditos", "Duracion", "Inicio", "Usuarios"]}
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
