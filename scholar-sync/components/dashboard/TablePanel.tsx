import TableRow from "@/components/dashboard/TableRow";

type TableRowData = Record<string, string | number> & { id: string | number };

type TablePanelProps = {
    title: string;
    description: string;
    columns: string[];
    rows: TableRowData[];
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onDelete?: (id: string | number) => void;
    isLoading?: boolean;
    emptyMessage?: string;
};

export default function TablePanel({
    title,
    description,
    columns,
    rows,
    canCreate,
    canUpdate,
    canDelete,
    onDelete,
    isLoading = false,
    emptyMessage = "Sin registros disponibles.",
}: TablePanelProps) {
    const createDisabled = !canCreate;
    const showActions = true;
    const showEmptyState = !isLoading && rows.length === 0;
    return (
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        {title}
                    </h2>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
                <button
                    type="button"
                    disabled={createDisabled}
                    aria-disabled={createDisabled}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        createDisabled
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                    Crear
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column}
                                    className="px-6 py-3 text-left font-semibold"
                                >
                                    {column}
                                </th>
                            ))}
                            {showActions && (
                                <th className="px-6 py-3 text-left font-semibold">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading && (
                            <tr>
                                <td
                                    className="px-6 py-6 text-slate-500"
                                    colSpan={columns.length + 1}
                                >
                                    Cargando informacion...
                                </td>
                            </tr>
                        )}
                        {showEmptyState && (
                            <tr>
                                <td
                                    className="px-6 py-6 text-slate-500"
                                    colSpan={columns.length + 1}
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                        {!isLoading &&
                            rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    columns={columns}
                                    row={row}
                                    canUpdate={canUpdate}
                                    canDelete={canDelete}
                                    onDelete={onDelete}
                                />
                            ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
