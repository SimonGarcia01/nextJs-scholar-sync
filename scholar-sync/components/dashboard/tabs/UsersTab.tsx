import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function UsersTab({
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onDelete,
}: EntityTabProps) {
    return (
        <TablePanel
            title="Usuarios"
            description="Listado general de estudiantes y docentes."
            columns={["Nombre", "Email", "Rol", "Nivel"]}
            rows={rows}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onDelete={onDelete}
        />
    );
}
