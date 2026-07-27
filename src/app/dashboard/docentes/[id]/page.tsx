import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getDocentePorId, getDocenteCatedras, getLicenciasPorDocente, getCatalogosAsignacion, getCargaHorariaPorDocente } from '@/actions/docentes';
import ExpedienteTabs from './ExpedienteTabs';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ExpedienteDocentePage({ params }: PageProps) {
    const resolvedParams = await params;
    const id_docente = parseInt(resolvedParams.id, 10);

    // Consultas paralelas directas a PostgreSQL
    const docente = await getDocentePorId(id_docente);
    if (!docente) notFound(); // Si no existe el ID, Next.js renderiza la UI 404

    const catedras = await getDocenteCatedras(id_docente);
    const licencias = await getLicenciasPorDocente(id_docente);
    const catalogos = await getCatalogosAsignacion();
    const carga_horaria = await getCargaHorariaPorDocente(id_docente);

    return (
        <div className="space-y-6">
            {/* Botón de Retorno y Cabecera de Ficha */}
            <div className="space-y-2">
                <Link href="/dashboard/docentes" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Volver al listado general
                </Link>
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        {docente.apellido}, {docente.nombre}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Datos personales, académico y artículos solicitados.</p>
                </div>
            </div>

            {/* Componente Modular con Tabs */}
            <ExpedienteTabs
                docente={docente}
                catedrasIniciales={catedras}
                licencias={licencias}
                catalogos={catalogos}
                carga_horaria={carga_horaria}
            />
        </div>
    );
}
