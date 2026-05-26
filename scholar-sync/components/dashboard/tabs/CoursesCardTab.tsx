import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function CoursesCardTab({
    rows,
    isLoading,
    emptyMessage,
}: EntityTabProps) {
    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">Cargando cursos...</p>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">
                    {emptyMessage ?? "Sin cursos por ahora."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Cursos
                </h2>
                <p className="text-sm text-slate-500">
                    Materias activas del semestre.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => (
                    <div
                        key={row.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                    >
                        <h3 className="font-semibold text-slate-900 line-clamp-2">
                            {String(row.Nombre ?? "-")}
                        </h3>
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                            {row.Creditos !== "-" && (
                                <p>
                                    <span className="text-slate-400">
                                        Créditos:
                                    </span>{" "}
                                    {String(row.Creditos)}
                                </p>
                            )}
                            {row.Duracion !== "-" && (
                                <p>
                                    <span className="text-slate-400">
                                        Duración:
                                    </span>{" "}
                                    {String(row.Duracion)}
                                </p>
                            )}
                            {row.Inicio !== "-" && (
                                <p>
                                    <span className="text-slate-400">
                                        Inicio:
                                    </span>{" "}
                                    {String(row.Inicio)}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
