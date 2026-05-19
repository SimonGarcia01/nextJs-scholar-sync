import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function PostsTab({
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
            title="Posts"
            description="Publicaciones recientes del foro."
            columns={["Titulo", "Autor", "Respuestas"]}
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
