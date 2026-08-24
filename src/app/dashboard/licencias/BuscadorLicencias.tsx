'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function BuscadorLicencias() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    function handleSearch(term: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');

        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }

        startTransition(() => {
            router.push(`/dashboard/licencias?${params.toString()}`);
        });
    }

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="🔍 Buscar por Agente, CUIL, Artículo o Turno ..."
                defaultValue={searchParams.get('search') || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full md:w-96 border p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {isPending && (
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 animate-pulse">
                    Filtrando...
                </span>
            )}
        </div>
    );
}
