import { query } from '@/lib/db';
import { getLicenciasCalendario } from '@/actions/calendario';
import CalendarioClient from './CalendarioClient';
import { redirect } from 'next/navigation';

interface PageProps {
    searchParams: Promise<{ anio?: string; mes?: string; turno?: string }>;
}

export default async function CalendarioPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;

    const hoy = new Date();
    const anioActual = parseInt(resolvedParams.anio || String(hoy.getFullYear()), 10);
    const mesActual = parseInt(resolvedParams.mes || String(hoy.getMonth() + 1), 10);
    const idTurnoActual = parseInt(resolvedParams.turno || '0', 10);

    // Traer catálogos de turnos y licencias filtradas concurrentemente
    const turnosCatalog = await query('SELECT id_turno, nombre FROM turnos WHERE turnos.mostrar = true ORDER BY nombre');
    const licencias = await getLicenciasCalendario(anioActual, mesActual, idTurnoActual);

    const handleMesChange = async (nuevoAnio: number, nuevoMes: number) => {
        'use server';
        // Arrastramos el filtro de turno activo al cambiar de mes
        const appendTurno = idTurnoActual ? `&turno=${idTurnoActual}` : '';
        redirect(`/dashboard/calendario?anio=${nuevoAnio}&mes=${nuevoMes}${appendTurno}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Agenda Mensual de Licencias</h2>
                <p className="text-sm text-slate-500 font-medium">Cronograma modular filtrado por turnos institucionales.</p>
            </div>

            <CalendarioClient
                initialLicencias={licencias}
                anioInicial={anioActual}
                mesInicial={mesActual}
                turnos={turnosCatalog.rows}
                idTurnoActual={idTurnoActual}
                onMesChange={handleMesChange}
            />
        </div>
    );
}
