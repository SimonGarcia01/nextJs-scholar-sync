"use client";

import { useEffect, useRef, useState } from "react";

export type FieldConfig = {
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
};

export type EntityFormModalProps = {
    isOpen: boolean;
    title: string;
    fields: FieldConfig[];
    initialValues?: Record<string, string>;
    onSubmit: (values: Record<string, string>) => Promise<void>;
    onClose: () => void;
};

export default function EntityFormModal({
    isOpen,
    title,
    fields,
    initialValues,
    onSubmit,
    onClose,
}: EntityFormModalProps) {
    const [values, setValues] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValues(initialValues ?? {});
        }
    }, [isOpen, initialValues]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    const handleChange = (name: string, value: string) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(values);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === backdropRef.current) {
                    onClose();
                }
            }}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold text-slate-900 mb-5">
                    {title}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field) => (
                        <label
                            key={field.name}
                            className="block text-sm font-medium text-slate-700"
                        >
                            {field.label}
                            {field.options ? (
                                <select
                                    value={values[field.name] ?? ""}
                                    onChange={(e) =>
                                        handleChange(field.name, e.target.value)
                                    }
                                    required={field.required}
                                    disabled={submitting}
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option value="">Seleccionar...</option>
                                    {field.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type ?? "text"}
                                    value={values[field.name] ?? ""}
                                    onChange={(e) =>
                                        handleChange(field.name, e.target.value)
                                    }
                                    required={field.required}
                                    disabled={submitting}
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                            )}
                        </label>
                    ))}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}