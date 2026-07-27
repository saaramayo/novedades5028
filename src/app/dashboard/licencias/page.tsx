import Link from 'next/link';
import { getLicenciasFiltradasYPaginadas, getFormContext } from '@/actions/licencias';
import LicenciaModalForm from './LicenciaModalForm';
import BuscadorLicencias from './BuscadorLicencias';
import SelectorEstado from './SelectorEstado';

// Componentes UI de Shadcn importados desde tu directorio de componentes
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import EditarLicenciaGeneralModal from './EditarLicenciaGeneralModal';

interface PageProps {
    searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function LicenciasPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const paginaActual = parseInt(resolvedParams.page || '1', 10);
    const searchTerm = resolvedParams.search || '';

    const { docentes, tipos } = await getFormContext();
    const { registros, totalPaginas } = await getLicenciasFiltradasYPaginadas(paginaActual, searchTerm);
    const searchAppend = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';

    return (
        <div className="space-y-6">
            {/* Cabecera Estilo Dashboard Profesional */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Control de Licencias</h2>
                    <p className="text-sm text-slate-500 font-medium">Historial y gestión de artículos del personal bajo Decreto 4118/97.</p>
                </div>

                {/* NUEVO COMPONENTE MODAL INTERACTIVO */}
                <LicenciaModalForm docentes={docentes} tipos={tipos} />
            </div>
            {/* Barra de Filtros */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-200">
                <h3 className="text-base font-semibold text-slate-900">Historial de Trámites</h3>
                <BuscadorLicencias />
            </div>

            {/* CONTENEDOR RESPONSIVO: Tarjetas en celular, Tabla en escritorio */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

                {/* VISTA A: TARJETAS COMPACTAS (Celulares) */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {registros.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-medium text-sm">
                            No se encontraron licencias cargadas con esos criterios.
                        </div>
                    ) : (
                        registros.map((r: any) => (
                            <div key={r.id_solicitud} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="font-mono bg-slate-50 font-bold text-[10px] text-slate-600 rounded">
                                        {r.articulo}
                                    </Badge>
                                    <SelectorEstado idSolicitud={r.id_solicitud} estadoActual={r.estado} />
                                    <EditarLicenciaGeneralModal licencia={r} tipos={tipos} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{r.agente}</p>
                                    <p className="text-xs text-slate-600 mt-0.5">Turno {r.turno}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500 font-medium">
                                        🗓️ {new Date(r.fecha_inicio).toLocaleDateString('es-AR')} al {new Date(r.fecha_fin).toLocaleDateString('es-AR')}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {r.tiempo} {r.descr_tiempo}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* VISTA B: TABLA TRADICIONAL (Escritorio) */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-slate-50/70">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-600">Docente</TableHead>
                                <TableHead className="font-semibold text-slate-600 text-center">Turno</TableHead>
                                <TableHead className="font-semibold text-slate-600">Artículo / Licencia</TableHead>
                                <TableHead className="font-semibold text-slate-600">Desde</TableHead>
                                <TableHead className="font-semibold text-slate-600">Hasta</TableHead>
                                <TableHead className="font-semibold text-slate-600 text-center">Tiempo</TableHead>
                                <TableHead className="font-semibold text-slate-600 text-center">Estado</TableHead>
                                <TableHead className="font-semibold text-slate-600 text-center">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registros.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-400 font-medium">
                                        No se encontraron licencias cargadas con esos criterios.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                registros.map((r: any) => (
                                    <TableRow key={r.id_solicitud} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium text-slate-900">{r.agente}</TableCell>
                                        <TableCell className="text-center">{r.turno}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline" className="font-mono bg-slate-50 font-bold px-1.5 py-0.5 text-xs text-slate-600 border-slate-200 rounded">
                                                    {r.articulo}
                                                </Badge>
                                                <span className="text-slate-600 text-sm font-medium">{r.denominacion}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-sm">{new Date(r.fecha_inicio).toLocaleDateString('es-AR')}</TableCell>
                                        <TableCell className="text-slate-600 text-sm">{new Date(r.fecha_fin).toLocaleDateString('es-AR')}</TableCell>
                                        <TableCell className="text-slate-600 text-sm">{r.tiempo} {r.descr_tiempo}</TableCell>
                                        <TableCell className="text-center">
                                            <SelectorEstado idSolicitud={r.id_solicitud} estadoActual={r.estado} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <EditarLicenciaGeneralModal licencia={r} tipos={tipos} />
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                        Página <strong className="text-slate-800">{paginaActual}</strong> de <strong className="text-slate-800">{totalPaginas}</strong>
                    </span>

                    <div className="flex space-x-2">
                        {paginaActual > 1 ? (
                            <Link
                                href={`/dashboard/licencias?page=${paginaActual - 1}${searchAppend}`}
                                className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                            >
                                ← Anterior
                            </Link>
                        ) : (
                            <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">
                                ← Anterior
                            </span>
                        )}

                        {paginaActual < totalPaginas ? (
                            <Link
                                href={`/dashboard/licencias?page=${paginaActual + 1}${searchAppend}`}
                                className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                            >
                                Siguiente →
                            </Link>
                        ) : (
                            <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">
                                Siguiente →
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
