import Link from 'next/link';
import { getDistribucionPaginada, getCatalogosDistribucion, deleteDistribucionSemanal } from '@/actions/distribucion';
import DistribucionModal from './DistribucionModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, CalendarDays } from 'lucide-react';
import BuscadorDistribucion from './BuscadorDistribucion';

interface Props { searchParams: Promise<{ page?: string; search?: string }>; }

export default async function DistribucionPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const pagina = parseInt(resolvedParams.page || '1', 10);
    const search = resolvedParams.search || '';

    const { distribuciones, totalPaginas } = await getDistribucionPaginada(pagina, search);
    const catalogos = await getCatalogosDistribucion();
    const searchAppend = search ? `&search=${encodeURIComponent(search)}` : '';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Distribución Semanal</h2>
                    <p className="text-sm text-slate-500 font-medium">Cronograma de bloques horarios de la institución.</p>
                </div>
                <DistribucionModal catalogos={catalogos} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-200">
                <h3 className="text-base font-semibold text-slate-900 flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-slate-400" /> Agenda de Bloques
                </h3>
                <BuscadorDistribucion />
            </div>

            {/* COMPONENTE RESPONSIVO HÍBRIDO */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs text-sm">

                {/* CELULARES (Tarjetas) */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {distribuciones.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-medium">Sin bloques agendados.</div>
                    ) : (
                        distribuciones.map((d: any) => (
                            <div key={d.id_distribucion} className="p-4 space-y-2 bg-white">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="font-bold text-slate-800 rounded">{d.dia_semana}</Badge>
                                    <span className="text-xs font-mono bg-slate-100 p-1 rounded font-bold text-slate-600">{d.nombre_bloque} ({d.turno_nombre})</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900">{d.materia_nombre}</p>
                                <p className="text-xs text-slate-500 font-medium">Docente: {d.docente_agente}</p>
                                <p className="text-xs text-slate-400 font-medium">{d.curso_nombre} - {d.division_nombre}</p>
                                <div className="flex justify-end pt-1">
                                    <form action={async () => { 'use server'; await deleteDistribucionSemanal(d.id_distribucion); }}>
                                        <button type="submit" className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Remover</button>
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
                                <TableHead>Día/Bloque</TableHead>
                                <TableHead>Materia/Curso</TableHead>
                                <TableHead>Docente</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {distribuciones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-400 font-medium">No se registran bloques agendados en esta página.</TableCell>
                                </TableRow>
                            ) : (
                                distribuciones.map((d: any) => (
                                    <TableRow key={d.id_distribucion}>
                                        <TableCell>
                                            <span className="font-bold text-slate-900 block">{d.dia_semana}</span>
                                            <span className="text-xs text-slate-400 font-medium block">{d.nombre_bloque} — {d.turno_nombre}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-slate-800 block">{d.materia_nombre}</span>
                                            <span className="text-xs text-slate-500 font-mono block">{d.curso_nombre} {d.division_nombre}</span>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-700">{d.docente_agente}</TableCell>
                                        <TableCell className="font-mono text-xs text-slate-600 font-bold">{d.hora_inicio.slice(0, 5)} a {d.hora_fin.slice(0, 5)}</TableCell>
                                        <TableCell className="text-right">
                                            <form action={async () => { 'use server'; await deleteDistribucionSemanal(d.id_distribucion); }}>
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
                        {pagina > 1 ? <Link href={`/dashboard/distribucion?page=${pagina - 1}${searchAppend}`} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">← Anterior</Link> : <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">← Anterior</span>}
                        {pagina < totalPaginas ? <Link href={`/dashboard/distribucion?page=${pagina + 1}${searchAppend}`} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">Siguiente →</Link> : <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">Siguiente →</span>}
                    </div>
                </div>

            </div>
        </div>
    );
}
