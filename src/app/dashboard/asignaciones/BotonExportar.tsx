'use client';

import { useTransition } from 'react';
import { exportarAsignacionesCSV } from '@/actions/asignaciones';
import { Download } from 'lucide-react';

export default function BotonExportar({ search }: { search: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDescarga = () => {
        startTransition(async () => {
            const res = await exportarAsignacionesCSV(search);

            if (res.error || !res.csv) {
                alert(res.error || 'Ocurrió un error al descargar.');
                return;
            }

            // Crear el archivo en memoria
            const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            // Simular el clic en un enlace de descarga invisible
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_catedras_${new Date().getFullYear()}.csv`);
            document.body.appendChild(link);
            link.click();

            // Limpieza de memoria
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    };

    return (
        <button
            onClick={handleDescarga}
            disabled={isPending}
            className="flex w-full sm:w-auto items-center justify-center px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
        >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            {isPending ? 'Procesando...' : 'Exportar Excel / CSV'}
        </button>
    );
}
