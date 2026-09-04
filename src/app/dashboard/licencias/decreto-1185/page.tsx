import { query } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDocentesBeneficiarios1185 } from '@/actions/decreto_1185';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Calendar, Clock, Award, UserCheck } from 'lucide-react';
import BotonAcreditar1185 from './BotonAcreditar1185';

interface PageProps {
    searchParams: Promise<{ anio?: string; mes?: string; turno?: string }>;
}

export default async function PaginaDecreto1185({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;

    const hoy = new Date();
    const anioActual = parseInt(resolvedParams.anio || String(hoy.getFullYear()), 10);
    const mesActual = parseInt(resolvedParams.mes || String(hoy.getMonth() + 1), 10);
    const idTurnoActual = parseInt(resolvedParams.turno || '0', 10);

    // Consultar catálogos para los filtros
    const turnosCatalog = await query('SELECT id_turno, nombre FROM turnos ORDER BY id_turno ASC');
    const { beneficiarios, error } = await getDocentesBeneficiarios1185(anioActual, mesActual, idTurnoActual);
    
    // Server Action inline para redireccionar mutando los parámetros URL de Next.js
    const handleFiltrar = async (formData: FormData) => {
        'use server';
        const a = formData.get('anio');
        const m = formData.get('mes');
        const t = formData.get('turno');
        redirect(`/dashboard/licencias/decreto-1185?anio=${a}&mes=${m}${t ? `&turno=${t}` : ''}`);
    };

    const mesesAnio = [
        { v: 1, n: 'Enero' }, { v: 2, n: 'Febrero' }, { v: 3, n: 'Marzo' }, { v: 4, n: 'Abril' },
        { v: 5, n: 'Mayo' }, { v: 6, n: 'Junio' }, { v: 7, n: 'Julio' }, { v: 8, n: 'Agosto' },
        { v: 9, n: 'Septiembre' }, { v: 10, n: 'Octubre' }, { v: 11, n: 'Noviembre' }, { v: 12, n: 'Diciembre' }
    ];

    return (
        <div className="space-y-6">
            {/* Cabecera Profesional */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-600 text-white rounded-lg shadow-xs">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Control de Estímulo — Dec. 1185</h2>
                        <p className="text-sm text-slate-500 font-medium">Nómina mensual de agentes con asistencia perfecta exceptuando licencias habilitadas.</p>
                    </div>
                </div>

                {/* INYECCIÓN DEL BOTÓN MASIVO INTELIGENTE */}
                <BotonAcreditar1185
                    anio={anioActual}
                    mes={mesActual}
                    turno={idTurnoActual}
                    deshabilitado={beneficiarios.length === 0}
                />
            </div>



            {/* BARRA DE FILTROS ORIENTADA A PROCESOS */}
            <form action={handleFiltrar} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Período Mensual</label>
                    <select name="mes" defaultValue={mesActual} className="w-full border p-2 rounded-lg text-xs bg-white font-semibold text-slate-700">
                        {mesesAnio.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ciclo</label>
                    <input type="number" name="anio" defaultValue={anioActual} className="w-full border p-2 rounded-lg text-xs bg-white font-semibold text-slate-700" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> Turno Escolar</label>
                    <select name="turno" defaultValue={idTurnoActual || ''} className="w-full border p-2 rounded-lg text-xs bg-white font-semibold text-slate-700">
                        <option value="">Todos los Turnos</option>
                        {turnosCatalog.rows.map((t: any) => <option key={t.id_turno} value={t.id_turno}>Turno {t.nombre}</option>)}
                    </select>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white rounded-lg text-xs font-bold py-2.5 hover:bg-slate-800 transition-colors shadow-xs">
                    Calcular Nómina
                </button>
            </form>

            {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border">{error}</div>}

            {/* RESULTADOS EN GRILLA ADAPTATIVA */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="bg-slate-50/70 p-3.5 border-b flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>DOCENTES ACREEDORES DE LICENCIA 1185</span>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-mono">{beneficiarios.length} Agentes</Badge>
                </div>

                {/* VISTA MÓVIL */}
                <div className="block sm:hidden divide-y divide-slate-100">
                    {beneficiarios.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-medium">Ningún agente generó el estímulo en este tramo.</div>
                    ) : (
                        beneficiarios.map((b: any) => (
                            <div key={b.id_docente} className="p-4 space-y-2 bg-white">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 text-sm">{b.docente_nombre}</span>
                                    <Badge className="bg-green-50 text-green-700 border-green-200 text-[9px] font-bold"><Award className="w-3 h-3 mr-0.5 inline" /> Otorgada</Badge>
                                </div>
                                <p className="text-xs text-slate-500 font-mono">DNI: {b.dni} | CUIL: {b.cuil}</p>
                                <Link href={`/dashboard/docentes/${b.id_docente}`} className="w-full text-center inline-flex justify-center px-3 py-1.5 border rounded-lg text-xs font-bold hover:bg-slate-50">
                                    Ver Expediente →
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* VISTA ESCRITORIO */}
                <div className="hidden sm:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agente Beneficiario</TableHead>
                                <TableHead>Documento Único (DNI)</TableHead>
                                <TableHead>CUIL</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead className="text-center">Crédito Estímulo</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {beneficiarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-400 font-medium">
                                        No se registran agentes con asistencia perfecta para las coordenadas seleccionadas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                beneficiarios.map((b: any) => (
                                    <TableRow key={b.id_docente} className="hover:bg-slate-50/40 transition-colors">
                                        <TableCell className="font-semibold text-slate-900 py-3.5 flex items-center space-x-2">
                                            <UserCheck className="w-4 h-4 text-purple-500 shrink-0" />
                                            <span>{b.docente_nombre}</span>
                                        </TableCell>
                                        <TableCell className="font-mono text-slate-500 text-xs font-semibold">{b.dni}</TableCell>
                                        <TableCell className="font-mono text-slate-400 text-xs">{b.cuil || '-'}</TableCell>
                                        <TableCell className="text-slate-600 text-xs font-medium font-mono">{b.celular || 'Sin teléfono'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold tracking-wide">
                                                +1 Día Disponible (Art. 1185)
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/docentes/${b.id_docente}`} className="inline-flex items-center px-2.5 py-1.5 border border-slate-200 text-slate-700 bg-white rounded-md text-xs font-bold hover:bg-slate-50 shadow-2xs">
                                                Auditar Legajo →
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

            </div>
        </div>
    );
}
