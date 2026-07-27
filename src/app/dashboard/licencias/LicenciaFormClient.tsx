'use client';

import { useActionState } from 'react';
import { createLicencia } from '@/actions/licencias';

export default function LicenciaForm({ docentes, tipos }: { docentes: any[], tipos: any[] }) {
    const [state, formAction] = useActionState(createLicencia, { error: null });

    return (
        <form action={formAction} className="space-y-3 bg-white p-5 rounded-xl border">
            {state?.error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded">{state.error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select name="id_docente" required className="border p-2 rounded text-sm bg-white">
                    <option value="">Seleccione Docente...</option>
                    {docentes.map(d => <option key={d.id_docente} value={d.id_docente}>{d.apellido}, {d.nombre}</option>)}
                </select>
                <select name="id_tipo_licencia" required className="border p-2 rounded text-sm bg-white">
                    <option value="">Seleccione Artículo...</option>
                    {tipos.map(t => <option key={t.id_tipo_licencia} value={t.id_tipo_licencia}>{t.articulo} - {t.denominacion}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="date" name="fecha_solicitud" required className="border p-2 rounded text-sm" />
                <input type="date" name="fecha_inicio" required className="border p-2 rounded text-sm" />
                <input type="date" name="fecha_fin" required className="border p-2 rounded text-sm" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 text-sm">
                Registrar Licencia
            </button>
        </form>
    );
}
