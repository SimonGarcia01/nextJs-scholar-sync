type TableRowProps = {
    columns: string[];
    row: Record<string, string | number> & { id: string | number };
    canUpdate: boolean;
    canDelete: boolean;
    onDelete?: (id: string | number) => void;
};

export default function TableRow({
    columns,
    row,
    canUpdate,
    canDelete,
    onDelete,
}: TableRowProps) {
    return (
        <tr className="text-slate-700">
            {columns.map((column) => (
                <td key={column} className="px-6 py-3">
                    {row[column] ?? "-"}
                </td>
            ))}
            {(canUpdate || canDelete) && (
                <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                        {canUpdate && (
                            <button
                                type="button"
                                className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Editar
                            </button>
                        )}
                        {canDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete?.(row.id)}
                                className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
}
