import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function SupplementarySessionsTab({
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onDelete,
}: EntityTabProps) {
    return (
        <TablePanel
            title="Sesiones de apoyo"
            description="Sesiones de apoyo academico."
            columns={["Tema", "Fecha", "Virtual", "Estado"]}
            rows={rows}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onDelete={onDelete}
        />
    );
}
