import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function CoursesTab({
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onDelete,
    isLoading,
    emptyMessage,
    onCreateClick,
    onEditClick,
}: EntityTabProps) {
    return (
        <TablePanel
            title="Cursos"
            description="Materias activas del semestre."
            columns={["Nombre", "Creditos", "Duracion", "Inicio", "Usuarios"]}
            rows={rows}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onDelete={onDelete}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            onCreateClick={onCreateClick}
            onEditClick={onEditClick}
        />
    );
}
