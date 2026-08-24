import { getFormContext, getLicenciasFiltradasYPaginadas } from '@/actions/licencias';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlignLeft, ArrowLeft, ArrowRight } from 'lucide-react';
import BuscadorLicencias from './BuscadorLicencias';
import AsignarLicenciaGlobalModal from './AsignarLicenciaGlobalModal';
import SelectorEstado from './SelectorEstado';
import EditarLicenciaGlobalModal from './EditarLicenciaGlobalModal';

interface PageProps {
    searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function LicenciasPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const paginaActual = parseInt(resolvedParams.page || '1', 10);
    const searchTerm = resolvedParams.search || '';

    const { docentes, tipos, turnos } = await getFormContext();
    const { registros, totalPaginas } = await getLicenciasFiltradasYPaginadas(paginaActual, searchTerm);
    const searchAppend = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Control de Licencias</h2>
                    <p className="text-sm text-slate-500 font-medium">Historial institucional bajo Decreto Provincial 4118/97.</p>
                </div>
                <AsignarLicenciaGlobalModal catalogos={{ docentes, tipos, turnos }} onSuccess={async () => { 'use server'; }} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-200">
                <h3 className="text-base font-semibold text-slate-900">Historial de Licencias</h3>
                <BuscadorLicencias />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-3xs overflow-hidden">
                {/* VISTA CELULARES */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {registros.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No se hallaron trámites coincidentes.</div>
                    ) : (
                        registros.map((r: any) => (
                            <div key={r.id_solicitud} className="p-4 space-y-3 bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                        <Badge variant="outline" className="font-mono bg-slate-50 text-[10px]">Art. {r.articulo} {r.letra}</Badge>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <SelectorEstado idSolicitud={r.id_solicitud} estadoActual={r.estado} />
                                        <EditarLicenciaGlobalModal licencia={r} catalogos={{ docentes, tipos, turnos }} onSuccess={async () => { 'use server'; }} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{r.agente}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Turno {r.turno}</p>
                                </div>
                                <div className="flex items-center justify-between border-t pt-2 border-slate-100 text-xs text-slate-500">
                                    <p>🗓️ {new Date(r.fecha_inicio).toLocaleDateString('es-AR')} al {new Date(r.fecha_fin).toLocaleDateString('es-AR')}</p>
                                    <p className="font-bold">{r.tiempo} {r.descr_tiempo}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* VISTA ESCRITORIO */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-slate-50/70">
                            <TableRow>
                                <TableHead>Docente</TableHead>
                                <TableHead className="text-center">Turno</TableHead>
                                <TableHead>Artículo</TableHead>
                                <TableHead>Vigencia</TableHead>
                                <TableHead className="text-center">Tiempo</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="text-center">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registros.length === 0 ? (
                                <TableRow><TableCell colSpan={10} className="h-24 text-center text-slate-400">No se hallaron registros.</TableCell></TableRow>
                            ) : (
                                registros.map((r: any) => (
                                    <TableRow key={r.id_solicitud} className="hover:bg-slate-50/40 text-sm">
                                        <TableCell className="font-semibold text-slate-900">{r.agente}</TableCell>
                                        <TableCell className="text-center font-medium text-slate-500 text-xs capitalize">{r.turno?.toLowerCase()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Badge variant="outline" className="font-mono bg-slate-50 font-bold text-xs shrink-0">Art. {r.articulo} {r.letra || ''}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 font-medium text-xs whitespace-nowrap">{new Date(r.fecha_inicio).toLocaleDateString('es-AR')} al {new Date(r.fecha_fin).toLocaleDateString('es-AR')}</TableCell>
                                        <TableCell className="text-slate-600 text-xs font-bold text-center whitespace-nowrap">{r.tiempo} {r.descr_tiempo}</TableCell>
                                        <TableCell className="text-center"><SelectorEstado idSolicitud={r.id_solicitud} estadoActual={r.estado} /></TableCell>
                                        <TableCell className="text-center"><EditarLicenciaGlobalModal licencia={r} catalogos={{ docentes, tipos, turnos }} onSuccess={async () => { 'use server'; }} /></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong></span>
                    <div className="flex space-x-2">
                        {paginaActual > 1 ? (
                            <Link href={`/dashboard/licencias?page=${paginaActual - 1}${searchAppend}`} className="inline-flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-3xs"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Anterior</Link>
                        ) : (
                            <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed inline-flex items-center"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Anterior</span>
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