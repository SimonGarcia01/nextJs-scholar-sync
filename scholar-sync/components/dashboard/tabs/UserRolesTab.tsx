import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function UserRolesTab({
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
            title="Usuarios y roles"
            description="Asignaciones de roles a usuarios."
            columns={["Usuario", "Rol"]}
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
