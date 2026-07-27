'use client';

import { useTransition } from 'react';
import { updateEstadoLicencia } from '@/actions/licencias';

interface SelectorEstadoProps {
    idSolicitud: number;
    estadoActual: string;
}

export default function SelectorEstado({ idSolicitud, estadoActual }: SelectorEstadoProps) {
    const [isPending, startTransition] = useTransition();

    const handleCambio = (nuevoEstado: string) => {
        startTransition(async () => {
            const res = await updateEstadoLicencia(idSolicitud, nuevoEstado);
            if (res?.error) {
                alert(res.error); // Alerta simple si falla la base de datos
            }
        });
    };

    // Estilos dinámicos según el estado seleccionado
    const colorClases: Record<string, string> = {
        Pendiente: 'bg-amber-50 text-amber-800 border-amber-300 focus:ring-amber-500',
        Aprobado: 'bg-green-50 text-green-800 border-green-300 focus:ring-green-500',
        Rechazado: 'bg-red-50 text-red-800 border-red-300 focus:ring-red-500',
    };

    return (
        <div className="relative inline-block w-36">
            <select
                defaultValue={estadoActual}
                disabled={isPending}
                onChange={(e) => handleCambio(e.target.value)}
                className={`w-full border p-1 rounded text-xs font-bold bg-white focus:outline-none focus:ring-2 transition-all ${colorClases[estadoActual] || 'bg-slate-50 text-slate-700'
                    } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <option value="Pendiente">⏳ Pendiente</option>
                <option value="Aprobado">✅ Aprobado</option>
                <option value="Rechazado">❌ Rechazado</option>
            </select>

            {isPending && (
                <span className="absolute -right-5 top-1.5 text-xs animate-spin">
                    🔄
                </span>
            )}
        </div>
    );
}
