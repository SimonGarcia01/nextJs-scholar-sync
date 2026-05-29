import TablePanel from "@/components/dashboard/TablePanel";
import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function ExperienceBadgesTab({
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
            title="Insignias"
            description="Catalogo de insignias de experiencia."
            columns={["Insignia", "Nivel", "Mensaje"]}
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
