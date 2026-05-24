import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function RepliesTab({
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onDelete,
    isLoading,
    emptyMessage,
}: EntityTabProps) {
    return (
        <TablePanel
            title="Respuestas del foro"
            description="Validaciones pendientes y respuestas recientes."
            columns={["Post", "Autor", "Aprobaciones", "Estado"]}
            rows={rows}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onDelete={onDelete}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
        />
    );
}
