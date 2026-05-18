import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function UserCoursesTab({
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onDelete,
}: EntityTabProps) {
    return (
        <TablePanel
            title="Usuarios y cursos"
            description="Matriculas por usuario."
            columns={["Usuario", "Curso", "Tipo"]}
            rows={rows}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onDelete={onDelete}
        />
    );
}
