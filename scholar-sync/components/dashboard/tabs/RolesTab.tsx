import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function RolesTab({
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onDelete,
}: EntityTabProps) {
    return (
        <TablePanel
            title="Roles"
            description="Control de acceso del sistema."
            columns={["Rol", "Descripcion"]}
            rows={rows}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onDelete={onDelete}
        />
    );
}
