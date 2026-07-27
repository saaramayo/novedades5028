'use client';

import { useActionState } from 'react';
import { loginAction } from '@/actions/auth';

export default function LoginPage() {
    // Inicializamos el hook con un estado vacío
    const [state, formAction, isPending] = useActionState(loginAction, { error: "" });

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                <h4 className="mb-6 text-center text-xl font-bold text-gray-800">
                    Sistema de Control de Novedades
                </h4>

                {/* Usamos 'formAction' en lugar de 'loginAction' directo */}
                <form action={formAction} className="space-y-4">

                    {/* Muestra el error en pantalla si las credenciales fallan */}
                    {state?.error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                            ⚠️ {state.error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-slate-900 p-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
                    >
                        {isPending ? 'Verificando...' : 'Ingresar al Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
}
