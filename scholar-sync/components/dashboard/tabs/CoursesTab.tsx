import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function CoursesTab({
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onDelete,
}: EntityTabProps) {
    return (
        <TablePanel
            title="Cursos"
            description="Materias activas del semestre."
            columns={["Nombre", "Creditos", "Duracion", "Inicio"]}
            rows={rows}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onDelete={onDelete}
        />
    );
}
