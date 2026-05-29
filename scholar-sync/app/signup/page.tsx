"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiService from "@/lib/apiService";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [major1, setMajor1] = useState("Software Engineering");
    const [major2, setMajor2] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await apiService.post("/user", {
                email,
                password,
                firstName,
                lastName,
                major1,
                ...(major2 ? { major2 } : {}),
                xp: 1,
                level: 1,
            });
            router.push("/login");
        } catch (err) {
            setError("No se pudo crear la cuenta. El email puede que ya exista.");
            console.log("Signup error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-(--blue-50) px-6 py-16">
            <div className="w-full max-w-md bg-white border border-(--border) rounded-2xl p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-slate-900">
                    Crear cuenta
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Registrate con tu correo institucional.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-slate-700">
                        Nombre
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="John"
                            required
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Apellido
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="Doe"
                            required
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Carrera principal
                        <select
                            value={major1}
                            onChange={(e) => setMajor1(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                            required
                        >
                            <option>Software Engineering</option>
                            <option>Biology</option>
                            <option>Chemistry</option>
                            <option>Physics</option>
                            <option>Mathematics</option>
                        </select>
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Carrera secundaria
                        <select
                            value={major2}
                            onChange={(e) => setMajor2(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                        >
                            <option value="">Sin seleccionar</option>
                            <option>Software Engineering</option>
                            <option>Biology</option>
                            <option>Chemistry</option>
                            <option>Physics</option>
                            <option>Mathematics</option>
                        </select>
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="dave@example.com"
                            required
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            maxLength={30}
                        />
                    </label>

                    {error && (
                        <p className="text-sm text-red-600" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 transition"
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
