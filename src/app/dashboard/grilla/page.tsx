import { getGrillaHorariaCompleta } from '@/actions/grilla';
import GrillaClient from './GrillaClient';

interface PageProps {
    searchParams: Promise<{ division?: string }>;
}

export default async function GrillaHorariaPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const idDivisionActual = parseInt(resolvedParams.division || '0', 10);

    // Ejecución de lectura directa en el servidor
    const { bloques, agenda, divisiones } = await getGrillaHorariaCompleta(idDivisionActual);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Grilla Horaria Institucional</h2>
                <p className="text-sm text-slate-500 font-medium">
                    Matriz unificada de control de espacios áulicos, módulos curriculares y turnos escolares.
                </p>
            </div>

            <GrillaClient
                bloques={bloques}
                agenda={agenda}
                divisiones={divisiones}
                idDivisionActual={idDivisionActual}
            />
        </div>
    );
}
