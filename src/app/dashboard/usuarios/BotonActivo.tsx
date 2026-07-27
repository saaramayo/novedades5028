'use client';

import { useTransition } from 'react';
import { toggleEstadoUsuario } from '@/actions/usuarios';

export default function BotonActivo({ idUsuario, activoActual }: { idUsuario: number, activoActual: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const res = await toggleEstadoUsuario(idUsuario, activoActual);
            if (res?.error) alert(res.error);
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all shadow-3xs ${activoActual
                    ? 'bg-green-100 text-green-800 hover:bg-red-50 hover:text-red-700 hover:content-["Suspender"]'
                    : 'bg-red-100 text-red-800 hover:bg-green-50 hover:text-green-700'
                } disabled:opacity-50`}
        >
            {isPending ? '...' : activoActual ? '● Activo (Habilitado)' : '○ Suspendido'}
        </button>
    );
}
