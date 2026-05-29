type TableRowProps = {
    columns: string[];
    row: Record<string, string | number> & { id: string | number };
    canUpdate: boolean;
    canDelete: boolean;
    onDelete?: (id: string | number) => void;
    onEdit?: (row: Record<string, string | number> & { id: string | number }) => void;
};

export default function TableRow({
    columns,
    row,
    canUpdate,
    canDelete,
    onDelete,
    onEdit,
}: TableRowProps) {
    const updateDisabled = !canUpdate;
    const deleteDisabled = !canDelete;
    return (
        <tr className="text-slate-700">
            {columns.map((column) => (
                <td key={column} className="px-6 py-3">
                    {row[column] ?? "-"}
                </td>
            ))}
            <td className="px-6 py-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={updateDisabled}
                        aria-disabled={updateDisabled}
                        onClick={!updateDisabled ? () => onEdit?.(row) : undefined}
                        className={`rounded-md border px-3 py-1 text-xs font-semibold transition ${
                            updateDisabled
                                ? "border-slate-200 text-slate-300 bg-slate-100 cursor-not-allowed"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        Editar
                    </button>
                    <button
                        type="button"
                        disabled={deleteDisabled}
                        aria-disabled={deleteDisabled}
                        onClick={() => {
                            if (!deleteDisabled) {
                                onDelete?.(row.id);
                            }
                        }}
                        className={`rounded-md border px-3 py-1 text-xs font-semibold transition ${
                            deleteDisabled
                                ? "border-slate-200 text-slate-300 bg-slate-100 cursor-not-allowed"
                                : "border-red-200 text-red-600 hover:bg-red-50"
                        }`}
                    >
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    );
}
