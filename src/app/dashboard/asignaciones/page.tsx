import Link from 'next/link';
import { getAsignacionesPaginadas, getCatalogosAsignaciones, deleteAsignacionGeneral } from '@/actions/asignaciones';
import AsignacionModal from './AsignacionModal';
import BuscadorAsignaciones from './BuscadorAsignaciones';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from 'lucide-react';
import EditarAsignacionModal from './EditarAsignacionModal';
import BotonExportar from './BotonExportar';

interface Props { searchParams: Promise<{ page?: string; search?: string }>; }

export default async function AsignacionesCRUDPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const pagina = parseInt(resolvedParams.page || '1', 10);
    const search = resolvedParams.search || '';

    const { asignaciones, totalPaginas } = await getAsignacionesPaginadas(pagina, search);
    const catalogos = await getCatalogosAsignaciones();
    const searchAppend = search ? `&search=${encodeURIComponent(search)}` : '';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Distribución de Materias</h2>
                    <p className="text-sm text-slate-500 font-medium">Asignación de materias y divisiones institucionales.</p>
                </div>
                <BotonExportar search={search} />
                <AsignacionModal catalogos={catalogos} />
            </div>

            {/* NUEVA BARRA DE BÚSQUEDA INTEGRADA */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-200">
                <h3 className="text-base font-semibold text-slate-900">Registros de Materias</h3>
                <BuscadorAsignaciones />
            </div>

            {/* LISTADO ADAPTATIVO */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs text-sm">

                {/* CELULARES (Tarjetas) */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {asignaciones.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-medium text-sm">No se encontraron materias asignadas.</div>
                    ) : (
                        asignaciones.map((a: any) => (
                            <div key={a.id_asignacion} className="p-4 space-y-2 bg-white">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 text-sm">{a.docente_agente}</span>
                                    <Badge variant="outline" className="font-mono text-[10px] bg-slate-50">{a.situacion_revista}</Badge>
                                </div>
                                <p className="text-xs font-semibold text-slate-700 w-70 truncate">{a.materia_nombre} {a.con_licencia ? '(Con lic. ' + a.descr_licencia + ')' : ''}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{a.curso_nombre} - {a.division_nombre} ({a.cant_hs} horas)<span className="text-xs text-slate-400 font-mono block">Turno {a.turno}</span></p>
                                <div className="flex justify-end pt-1">
                                    <EditarAsignacionModal asignacion={a} catalogos={catalogos} />
                                    <form action={async () => { 'use server'; await deleteAsignacionGeneral(a.id_asignacion); }}>
                                        <button type="submit" className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ESCRITORIO (Tabla) */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-slate-50/70">
                            <TableRow>
                                <TableHead>Docente</TableHead>
                                <TableHead>Materia</TableHead>
                                <TableHead>Curso/División</TableHead>
                                <TableHead>Situación Revista</TableHead>
                                <TableHead className="text-center">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {asignaciones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-400 font-medium">No se encontraron cátedras asignadas.</TableCell>
                                </TableRow>
                            ) : (
                                asignaciones.map((a: any) => (
                                    <TableRow key={a.id_asignacion}>
                                        <TableCell className="font-semibold text-slate-900">{a.docente_agente} <span className="text-xs text-slate-400 font-mono block">DNI: {a.dni}</span></TableCell>
                                        <TableCell className="font-medium text-slate-700">{a.materia_nombre} <span className="text-xs text-slate-400 font-mono block w-30 truncate">{a.con_licencia ? 'Con lic. ' + a.descr_licencia : ''}</span></TableCell>
                                        <TableCell className="text-slate-600">{a.curso_nombre} — <span className="font-bold">{a.division_nombre}</span> ({a.cant_hs} horas)<span className="text-xs text-slate-400 font-mono block">Turno {a.turno}</span></TableCell>
                                        <TableCell><Badge variant="outline" className="font-mono bg-slate-50">{a.situacion_revista}</Badge></TableCell>
                                        <TableCell className="text-center">
                                            <EditarAsignacionModal asignacion={a} catalogos={catalogos} />
                                            <form action={async () => { 'use server'; await deleteAsignacionGeneral(a.id_asignacion); }}>
                                                <button type="submit" className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong></span>
                    <div className="flex space-x-2">
                        {pagina > 1 ? <Link href={`/dashboard/asignaciones?page=${pagina - 1}${searchAppend}`} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">← Anterior</Link> : <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">← Anterior</span>}
                        {pagina < totalPaginas ? <Link href={`/dashboard/asignaciones?page=${pagina + 1}${searchAppend}`} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">Siguiente →</Link> : <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">Siguiente →</span>}
                    </div>
                </div>

            </div>
        </div>
    );
}
