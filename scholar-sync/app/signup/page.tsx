"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiService from "@/lib/apiService";

const MAJORS = [
    "Software Engineering",
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
];

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        major1: "Software Engineering",
        xp: 0,
        level: 1,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await apiService.post("/user", {
                ...form,
                xp: 0,
                level: 1,
            });
            router.push("/login");
        } catch {
            setError("No se pudo crear la cuenta. El email puede ya estar en uso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-(--blue-50) px-6 py-16">
            <div className="w-full max-w-md bg-white border border-(--border) rounded-2xl p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Registrate con tu correo institucional.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    {[
                        { name: "firstName", label: "Nombre", type: "text" },
                        { name: "lastName", label: "Apellido", type: "text" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "password", label: "Password", type: "password" },
                    ].map(({ name, label, type }) => (
                        <label key={name} className="block text-sm font-medium text-slate-700">
                            {label}
                            <input
                                type={type}
                                name={name}
                                value={form[name as keyof typeof form] as string}
                                onChange={handleChange}
                                required
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </label>
                    ))}

                    <label className="block text-sm font-medium text-slate-700">
                        Carrera
                        <select
                            name="major1"
                            value={form.major1}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                            {MAJORS.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </label>

                    {error && (
                        <p className="text-sm text-red-600" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 transition disabled:bg-slate-200 disabled:text-slate-500"
                    >
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-slate-600">
                    Ya tienes cuenta?{" "}
                    <Link href="/login" className="text-blue-600 font-semibold">
                        Iniciar sesion
                    </Link>
                </p>
            </div>
        </div>
    );
}
