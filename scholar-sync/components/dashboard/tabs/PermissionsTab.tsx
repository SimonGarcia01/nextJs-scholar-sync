import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function PermissionsTab({
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
            title="Permisos"
            description="Lista de permisos disponibles."
            columns={["Nombre", "Descripcion"]}
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
