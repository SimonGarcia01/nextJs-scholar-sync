"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "@/lib/authService";
import useAuthStore from "@/_store/authStore";

export default function LoginPage() {
    const router = useRouter();
    const { setToken } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await authService.login({ email, password });
            setToken(response.access_token);
            router.push("/dashboard");
        } catch (err) {
            setError("Credenciales invalidas o usuario no encontrado.");
            console.log("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-(--blue-50) px-6 py-16">
            <div className="w-full max-w-md bg-white border border-(--border) rounded-2xl p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-slate-900">
                    Iniciar sesion
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Ingresa con tu correo institucional.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-slate-700">
                        Email
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="dave@example.com"
                            required
                        />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                        Password
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            maxLength={20}
                        />
                    </label>

                    {error && (
                        <p className="text-sm text-red-600" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 transition"
                        disabled={loading}
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-slate-600">
                    No tienes cuenta?{" "}
                    <Link href="/signUp" className="text-blue-600 font-semibold">
                        Crear cuenta
                    </Link>
                </p>
            </div>
        </div>
    );
}
