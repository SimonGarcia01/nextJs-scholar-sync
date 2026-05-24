import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col flex-1 bg-(--blue-50) font-sans min-h-screen">
            <main className="flex-1">
                <section className="max-w-6xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-2 items-center">
                    <div>
                        <p className="eyebrow">Universidad ICESI</p>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                            Scholar Sync para clases, foros y apoyo academico.
                        </h1>
                        <p className="mt-4 text-lg text-slate-600 max-w-xl">
                            Centraliza anuncios, sesiones de apoyo y espacios de
                            discusion entre estudiantes y docentes.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/login" className="btn-primary">
                                Iniciar sesion
                            </Link>
                            <Link href="/signup" className="btn-secondary">
                                Crear cuenta
                            </Link>
                        </div>
                    </div>
                    <div className="panel">
                        <div className="panel-header">
                            <span>Novedades</span>
                            <span className="text-xs text-slate-500">
                                Campus
                            </span>
                        </div>
                        <div className="panel-body">
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <span className="status-dot" />
                                    Taller de bienestar estudiantil esta semana.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="status-dot" />
                                    Sesiones de apoyo para matematicas y fisica.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="status-dot" />
                                    Foro abierto para preguntas del parcial.
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-6 pb-20">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="card">
                            <h3 className="card-title">Monitorias</h3>
                            <p className="card-text">
                                Crea sesiones de apoyo, loggea el progreso y
                                demás.
                            </p>
                        </div>
                        <div className="card">
                            <h3 className="card-title">Foro</h3>
                            <p className="card-text">
                                Publica preguntas, respuestas y validaciones
                                para apoyo entre estudiantes.
                            </p>
                        </div>
                        <div className="card">
                            <h3 className="card-title">Insignias</h3>
                            <p className="card-text">
                                Gamifica el progreso con niveles, xp e insignias
                                personalizadas.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
