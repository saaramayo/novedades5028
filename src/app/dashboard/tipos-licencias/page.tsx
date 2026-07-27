import Link from 'next/link';
import { getTiposLicenciasPaginados, deleteTipoLicencia } from '@/actions/tipos_licencias';
import TipoLicenciaModal from './TipoLicenciaModal';
import EditarTipoLicenciaModal from './EditarTipoLicenciaModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from 'lucide-react';
import BuscadorTiposLicencias from './BuscadorTiposLicencias';

interface Props { searchParams: Promise<{ page?: string; search?: string }>; }

export default async function TiposLicenciasPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const pagina = parseInt(resolvedParams.page || '1', 10);
    const search = resolvedParams.search || '';

    const { tiposLicencias, totalPaginas } = await getTiposLicenciasPaginados(pagina, search);
    const searchAppend = search ? `&search=${encodeURIComponent(search)}` : '';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Nomenclador de Licencias</h2>
                    <p className="text-sm text-slate-500 font-medium">Parámetros normativos y artículos del Decreto Provincial 4118/97.</p>
                </div>
                <TipoLicenciaModal />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-200">
                <h3 className="text-base font-semibold text-slate-900">Artículos Registrados</h3>
                <BuscadorTiposLicencias />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs text-sm">

                {/* CELULARES (Vista Tarjetas con bloque de Observaciones dedicado) */}
                <div className="block lg:hidden divide-y divide-slate-100">
                    {tiposLicencias.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-medium">Sin artículos que coincidan.</div>
                    ) : (
                        tiposLicencias.map((item: any) => (
                            <div key={item.id_tipo_licencia} className="p-4 space-y-3 bg-white">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="font-mono bg-slate-50 font-bold text-slate-700">{item.articulo}</Badge>
                                    <Badge variant={item.goce_haberes ? 'default' : 'secondary'} className="text-[10px]">{item.goce_haberes ? 'Con Goce' : 'Sin Goce'}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{item.denominacion}</p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Límite: {item.limite_dias_max ? `${item.limite_dias_max} días` : 'No aplica'}</p>
                                </div>
                                {item.observaciones && (
                                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 font-medium">
                                        <span className="font-bold text-slate-500 block mb-0.5">Observaciones:</span>
                                        {item.observaciones}
                                    </div>
                                )}
                                <div className="flex justify-end space-x-2 pt-1">
                                    <EditarTipoLicenciaModal item={item} />
                                    <form action={async () => { 'use server'; const r = await deleteTipoLicencia(item.id_tipo_licencia); if (r?.error) alert(r.error); }}>
                                        <button type="submit" className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg">Remover</button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ESCRITORIO (Tabla Estilizada de Shadcn UI) */}
                <div className="hidden lg:block">
                    <Table>
                        <TableHeader className="bg-slate-50/70">
                            <TableRow>
                                <TableHead>Artículo</TableHead>
                                <TableHead>Denominación / Encuadre</TableHead>
                                <TableHead>Límite</TableHead>
                                <TableHead>Haberes</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tiposLicencias.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-400 font-medium">No se registran artículos en esta página.</TableCell>
                                </TableRow>
                            ) : (
                                tiposLicencias.map((item: any) => (
                                    <TableRow key={item.id_tipo_licencia}>
                                        <TableCell><Badge variant="outline" className="font-mono bg-slate-50 font-bold text-slate-700">{item.articulo}</Badge></TableCell>
                                        <TableCell className="font-semibold text-slate-900">{item.denominacion}</TableCell>
                                        <TableCell className="text-slate-600 font-medium">{item.limite_dias_max ? `${item.limite_dias_max} días` : 'No aplica'}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.goce_haberes ? 'default' : 'secondary'} className="text-[10px] rounded font-bold">
                                                {item.goce_haberes ? 'Con Goce' : 'Sin Goce'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <EditarTipoLicenciaModal item={item} />
                                                <form action={async () => { 'use server'; const r = await deleteTipoLicencia(item.id_tipo_licencia); if (r?.error) alert(r.error); }}>
                                                    <button type="submit" className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </form>
                                            </div>
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
                        {pagina > 1 ? <Link href={`/dashboard/tipos-licencias?page=${pagina - 1}${searchAppend}`} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs">← Anterior</Link> : <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">← Anterior</span>}
                        {pagina < totalPaginas ? <Link href={`/dashboard/tipos-licencias?page=${pagina + 1}${searchAppend}`} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs">Siguiente →</Link> : <span className="bg-slate-50 border border-slate-100 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold cursor-not-allowed">Siguiente →</span>}
                    </div>
                </div>

            </div>
        </div>
    );
}
