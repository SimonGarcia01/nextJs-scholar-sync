import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function AttendanceSuppSessionsTab({
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
            title="Asistencias"
            description="Asistencias a sesiones de apoyo."
            columns={["Sesion", "TA", "Estudiante", "Notas"]}
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
