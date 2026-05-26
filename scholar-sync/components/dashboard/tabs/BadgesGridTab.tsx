import type { EntityTabProps } from "@/components/dashboard/tabs/types";

export default function BadgesGridTab({
    rows,
    isLoading,
    emptyMessage,
}: EntityTabProps) {
    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">
                    Cargando insignias...
                </p>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">
                    {emptyMessage ?? "Sin insignias por ahora."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Insignias
                </h2>
                <p className="text-sm text-slate-500">
                    Logros disponibles en la plataforma.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => (
                    <div
                        key={row.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center text-center gap-2"
                    >
                        <span className="text-3xl">🏅</span>
                        <h3 className="font-semibold text-slate-900">
                            {String(row.Insignia ?? "-")}
                        </h3>
                        {row.Nivel !== "-" && (
                            <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">
                                Nivel {String(row.Nivel)}
                            </span>
                        )}
                        {row.Mensaje !== "-" && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                                {String(row.Mensaje)}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
