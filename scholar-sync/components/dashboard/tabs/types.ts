export type TabRows = (Record<string, string | number> & {
    id: string | number;
})[];

export type EntityTabProps = {
    rows: TabRows;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onDelete: (id: string | number) => void;
};
