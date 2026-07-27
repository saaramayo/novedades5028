'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function Buscador() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    function handleSearch(term: string) {
        const params = new URLSearchParams(searchParams.toString());

        // Al realizar una nueva búsqueda, reiniciamos siempre a la página 1
        params.set('page', '1');

        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }

        startTransition(() => {
            router.push(`/dashboard/docentes?${params.toString()}`);
        });
    }

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="🔍 Buscar por Apellido, CUIL o Cargo..."
                defaultValue={searchParams.get('search') || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full md:w-80 border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            {isPending && (
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 animate-pulse">
                    Buscando...
                </span>
            )}
        </div>
    );
}
