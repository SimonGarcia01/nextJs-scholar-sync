"use client";

import { useState, type FormEvent } from "react";

export type FormField = {
    key: string;
    label: string;
    type: "text" | "email" | "password" | "number" | "date" | "textarea" | "boolean";
    required?: boolean;
};

type FormModalProps = {
    title: string;
    fields: FormField[];
    initialValues?: Record<string, string | number | boolean>;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    onClose: () => void;
};

export default function FormModal({
    title,
    fields,
    initialValues = {},
    onSubmit,
    onClose,
}: FormModalProps) {
    const [values, setValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(
            fields.map((f) => {
                const raw = initialValues[f.key];
                if (raw === undefined || raw === null) return [f.key, ""];
                if (f.type === "date" && typeof raw === "string" && raw.includes("T")) {
                    return [f.key, raw.split("T")[0]];
                }
                if (f.type === "boolean") {
                    return [f.key, raw === true || raw === "true" ? "true" : "false"];
                }
                return [f.key, String(raw)];
            })
        )
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (key: string, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const parsed: Record<string, unknown> = {};
            for (const field of fields) {
                const raw = values[field.key];
                if (raw === "" && !field.required) continue;
                if (field.type === "number") {
                    parsed[field.key] = Number(raw);
                } else if (field.type === "boolean") {
                    parsed[field.key] = raw === "true";
                } else if (field.type === "date" && raw) {
                    parsed[field.key] = new Date(raw).toISOString();
                } else {
                    parsed[field.key] = raw;
                }
            }
            await onSubmit(parsed);
            onClose();
        } catch {
            setError("Error al guardar. Verifica los datos.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {fields.map((field) => (
                        <label key={field.key} className="block text-sm font-medium text-slate-700">
                            {field.label}
                            {field.type === "textarea" ? (
                                <textarea
                                    value={values[field.key]}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    required={field.required}
                                    rows={3}
                                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                                />
                            ) : field.type === "boolean" ? (
                                <select
                                    value={values[field.key]}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="false">No</option>
                                    <option value="true">Si</option>
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    value={values[field.key]}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    required={field.required}
                                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            )}
                        </label>
                    ))}

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 transition"
                        >
                            {submitting ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
