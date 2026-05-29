export type TabRows = (Record<string, string | number> & {
    id: string | number;
})[];

export type EntityTabProps = {
    rows: TabRows;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onCreate?: () => void;
    onEdit?: (row: TabRows[number]) => void;
    onRefresh?: () => void;
    onDelete: (id: string | number) => void;
    isLoading?: boolean;
    emptyMessage?: string;
};
