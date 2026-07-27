'use client';

import { useActionState, useState, useEffect } from 'react';
import { updatePerfilPropio } from '@/actions/usuarios';
import { Save, CheckCircle } from 'lucide-react';

export default function FormularioPerfilClient({ usuario }: { usuario: any }) {
    const [exitoVisual, setExitoVisual] = useState(false);
    const [state, formAction, isPending] = useActionState(updatePerfilPropio, { error: null, success: false });

    useEffect(() => {
        if (state?.success) {
            setExitoVisual(true);
            // Ocultar el mensaje de éxito verde a los 4 segundos
            const timer = setTimeout(() => setExitoVisual(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                    ⚠️ {state.error}
                </div>
            )}

            {exitoVisual && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-lg flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 shrink-0" /> Perfil y credenciales actualizados con éxito en el sistema.
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Mostrar</label>
                    <input
                        type="text"
                        name="nombre"
                        defaultValue={usuario.nombre}
                        required
                        className="w-full border p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico Oficial</label>
                    <input
                        type="email"
                        name="email"
                        defaultValue={usuario.email}
                        required
                        className="w-full border p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                </div>

                <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Cambiar Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Escriba aquí solo si desea modificar su clave actual"
                        className="w-full border border-blue-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                    />
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">Mínimo obligatorio de 6 caracteres.</span>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isPending ? 'Guardando...' : 'Aplicar Modificaciones'}
                </button>
            </div>
        </form>
    );
}
