import { getNovedadesDelDia } from '@/actions/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Clock, AlertCircle, UserX } from 'lucide-react';

export default async function DashboardPage() {
    const data = await getNovedadesDelDia();

    return (
        <div className="space-y-8">
            {/* Encabezado */}
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Panel de Novedades Diarias</h2>
                <p className="text-sm text-slate-500 font-medium">Colegio N° 5028 &quot;Reyes Católicos&quot; — Alertas de Planta Activa.</p>
            </div>

            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planta Total de Agentes</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.totalAgentes} Registrados</h3>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Users className="w-5 h-5" /></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planta Total de Docentes</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.totalDocentes} Registrados</h3>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Users className="w-5 h-5" /></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ausencias Activas Hoy</p>
                        <h3 className="text-2xl font-bold text-blue-600 mt-1">{data.totalLicenciasHoy} Agentes</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FileText className="w-5 h-5" /></div>
                </div>
            </div>

            {/* SECCIÓN DE TABLAS ASIGNADAS POR TURNO */}
            <div className="space-y-6">
                <div className="border-b pb-2 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Alertas de Licencias por Turno</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {data.turnos.map((turno: any) => {
                        // Filtrado inmediato por el campo id_turno de la solicitud de licencia
                        const licenciasDelTurno = data.licencias.filter(
                            (lic: any) => lic.id_turno === turno.id_turno
                        );

                        return (
                            <div key={turno.id_turno} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

                                {/* Cabecera del Turno */}
                                <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center capitalize">
                                        <span className="w-2 h-2 rounded-full bg-slate-700 mr-2"></span>
                                        Turno {turno.nombre.toLowerCase()}
                                    </h4>
                                    <Badge variant={licenciasDelTurno.length > 0 ? "destructive" : "secondary"} className="font-bold text-[10px]">
                                        {licenciasDelTurno.length} {licenciasDelTurno.length === 1 ? 'Novedad' : 'Novedades'}
                                    </Badge>
                                </div>

                                {/* Grid / Tabla Adaptativa */}
                                <div className="overflow-x-auto text-sm">
                                    {licenciasDelTurno.length === 0 ? (
                                        <div className="p-6 text-center text-slate-400 font-medium flex items-center justify-center space-x-2">
                                            <AlertCircle className="w-4 h-4 text-slate-300" />
                                            <span>Sin novedades reportadas para el Turno {turno.nombre} hoy.</span>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="bg-slate-50/30">
                                                <TableRow>
                                                    <TableHead className="w-[120px]">CUIL</TableHead>
                                                    <TableHead>Agente/Docente</TableHead>
                                                    <TableHead className="text-right">Artículo Decreto 4118</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {licenciasDelTurno.map((lic: any) => (
                                                    <TableRow key={lic.id_solicitud} className="hover:bg-slate-50/40 transition-colors">
                                                        <TableCell className="font-mono text-xs font-bold text-slate-500">{lic.cuil}</TableCell>
                                                        <TableCell className="font-semibold text-slate-900 flex items-center space-x-2 py-3">
                                                            <UserX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <span>{lic.docente_nombre}</span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold tracking-wide">
                                                                Art. {lic.articulo}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
